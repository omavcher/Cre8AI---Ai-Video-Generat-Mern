require("dotenv").config();
const axios = require("axios");
const cloudinary = require("cloudinary").v2;
const gtts = require("gtts");
const mongoose = require("mongoose");
const AICreation = require("../models/AICreation");

cloudinary.config({
    cloud_name: "dg9qjhpsc",
    api_key: "951271919586525",
    api_secret: "V5yhJVDuIgeDhuw3MqmYTiT1J00",
});

const languageMap = {
    "english": "en",
    "hindi": "hi",
    "spanish": "es",
    "french": "fr",
    "german": "de",
    "tamil": "ta",
    "telugu": "te",
    "marathi": "mr",
};

const formatDimensions = {
    "square": { width: 512, height: 512 },
    "vertical": { width: 512, height: 910 },
    "landscape": { width: 910, height: 512 },
};

// Helper function for retrying Gradio requests
async function generateWithRetry(client, params, retries = 3, stepName = "generation") {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const result = await client.predict("/run", params);
            console.log(`Gradio response for ${stepName} (attempt ${attempt}):`, JSON.stringify(result, null, 2));
            if (result.data[0]?.url) return result.data[0].url;
            throw new Error(`No valid URL in ${stepName} response`);
        } catch (error) {
            console.log(`Retry ${attempt}/${retries} for ${stepName} failed:`, error.message || JSON.stringify(error, null, 2));
            if (attempt === retries) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
}

// Helper function to retry Cloudinary uploads
async function uploadToCloudinaryWithRetry(streamOrBuffer, options, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { ...options, timeout: 60000 }, // Increased timeout to 60 seconds
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                if (streamOrBuffer.pipe) {
                    streamOrBuffer.pipe(uploadStream);
                } else {
                    uploadStream.end(streamOrBuffer);
                }
            });
            return uploadResult;
        } catch (error) {
            console.error(`Cloudinary upload attempt ${attempt}/${retries} failed:`, error.message);
            if (attempt === retries) throw error;
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Exponential backoff
        }
    }
}

const generateVideoIdeas = async (req, res) => {
    try {
        const { platform } = req.body;
        if (!platform) {
            return res.status(400).json({ success: false, message: "Platform selection is required" });
        }

        const prompt = `Generate a short video idea suitable for ${platform} in India. The idea should be engaging and fit the platform's audience, such as a mini-story, thrilling moment, horror twist, or an exciting trend, not like big give in text almost 10-20 words with some emojis. only one`;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            { contents: [{ parts: [{ text: prompt }] }] },
            { headers: { "Content-Type": "application/json" } }
        );

        const idea = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No idea generated.";
        res.json({ success: true, idea });
    } catch (error) {
        console.error("Error in generateVideoIdeas:", error.message, error.stack);
        res.status(500).json({ success: false, message: "Error generating ideas", error: error.message });
    }
};

const generateVideoStructure = async (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const sendEvent = (event, data) => {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
        const { platform, format, language, voiceType, backgroundMusic, videoEffects, idea } = req.body;

        if (!platform || !format || !language || !voiceType || backgroundMusic === undefined || !videoEffects || !idea) {
            sendEvent("error", { success: false, message: "All fields are required" });
            return res.end();
        }

        if (!req.user || !req.user._id) {
            sendEvent("error", { success: false, message: "User not authenticated" });
            return res.end();
        }

        const dimensions = formatDimensions[format.toLowerCase()];
        if (!dimensions) {
            sendEvent("error", { success: false, message: `Format '${format}' is not supported. Use 'square', 'vertical', or 'landscape'` });
            return res.end();
        }

        const gttsLanguage = languageMap[language.toLowerCase()];
        if (!gttsLanguage) {
            sendEvent("error", { success: false, message: `Language '${language}' is not supported` });
            return res.end();
        }

        const scriptPrompt = `
Generate a script for a ${format} video on ${platform}.
Idea: ${idea}
Provide a voice-over script in ${language} (Only the spoken words, without technical cues like "fade in," "image display," or sound effect descriptions).
Use a ${voiceType} voice for the narration.
Include ${backgroundMusic ? "background music" : "no background music"}.
Add ${videoEffects} video effects.
For each image prompt, also provide a negative prompt to exclude unwanted elements (e.g., "Blurry, low quality, distorted").
Additionally, suggest a thumbnail idea suitable for ${platform}, including the recommended platform and format size (e.g., "TikTok, 1080x1920").
Generate an SEO title, description, 10 keywords, 3-5 hashtags, and the best time to post in India (in Indian Standard Time, e.g., "7:00 PM").
Return the response in JSON format like this:
{
    "platform": "${platform}",
    "format": "${format}",
    "idea": "${idea}",
    "voiceOver": "Generated voice-over script without technical instructions",
    "imageCount": 5,
    "imagePrompts": [
        { "prompt": "First image description", "negativePrompt": "First negative prompt" },
        { "prompt": "Second image description", "negativePrompt": "Second negative prompt" }
    ],
    "thumbnail": {
        "idea": "Thumbnail idea description",
        "platform": "suitable for ${platform}",
        "formatSize": "Recommended size for this ${platform} (e.g., 1080x1920)"
    },
    "seo": {
        "title": "SEO title for the video",
        "description": "SEO description for the video",
        "keywords": ["keyword1", "keyword2", ...], // 10 keywords
        "hashtags": ["#hashtag1", "#hashtag2", ...], // 3-5 hashtags
        "bestTimeToPostIndia": "Best time to upload on ${platform} tell the time  in IST"
    }
}
`;

        console.log("Sending script prompt to Gemini API...");
        const geminiResponse = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            { contents: [{ parts: [{ text: scriptPrompt }] }] },
            { headers: { "Content-Type": "application/json" } }
        );

        let responseContent = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!responseContent) {
            sendEvent("error", { success: false, message: "Failed to parse AI response" });
            return res.end();
        }

        responseContent = responseContent.replace(/```json|```/g, "").trim();
        let videoStructure;
        try {
            videoStructure = JSON.parse(responseContent);
            console.log("Video Structure parsed successfully:", JSON.stringify(videoStructure, null, 2));
        } catch (jsonError) {
            console.error("Failed to parse AI response:", responseContent, jsonError);
            sendEvent("error", { success: false, message: "Invalid AI response format", error: jsonError.message });
            return res.end();
        }

        sendEvent("title", { title: videoStructure.seo.title });
        sendEvent("description", { description: videoStructure.seo.description });

        const totalSteps = 1 + 1 + videoStructure.imageCount; // Audio + Thumbnail + Images
        let completedSteps = 0;
        const initialTimePerStep = 10; // seconds
        let estimatedTime = totalSteps * initialTimePerStep;
        sendEvent("progress", { percentage: 0, estimatedTime });

        // Generate Audio Stream and Upload to Cloudinary Directly
        const voiceOverText = videoStructure.voiceOver.replace(/\([^)]+\)/g, "").trim();
        console.log("Generating audio stream...");
        const speech = new gtts(voiceOverText, gttsLanguage);
        const audioStream = speech.stream();

        console.log("Uploading audio stream to Cloudinary...");
        const audioUploadResult = await uploadToCloudinaryWithRetry(
            audioStream,
            { resource_type: "video" }
        );
        const audioUrl = audioUploadResult.secure_url;
        console.log("Uploaded audio URL:", audioUrl);

        completedSteps++;
        estimatedTime = (totalSteps - completedSteps) * initialTimePerStep;
        sendEvent("progress", { percentage: (completedSteps / totalSteps) * 100, estimatedTime });

        // Gradio client setup
        const { Client } = await import("@gradio/client");
        console.log("Connecting to Gradio client...");
        const client = await Client.connect("multimodalart/stable-cascade", {
            headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` }
        });
        console.log("Gradio client connected successfully");

        // Generate and Upload Thumbnail
        let thumbnailUrl = null;
        console.log("Generating thumbnail image...");
        const thumbnailPrompt = `${videoStructure.thumbnail.idea}, ${format} orientation, high detail, 4K resolution`;
        const thumbnailNegativePrompt = "Blurry, low quality, distorted, watermark, text overlay";

        const thumbnailParams = {
            prompt: thumbnailPrompt,
            negative_prompt: thumbnailNegativePrompt,
            seed: 0,
            width: dimensions.width,
            height: dimensions.height,
            prior_num_inference_steps: 20,
            prior_guidance_scale: 4,
            decoder_num_inference_steps: 10,
            decoder_guidance_scale: 1,
            num_images_per_prompt: 1,
        };

        try {
            const tempThumbnailUrl = await generateWithRetry(client, thumbnailParams, 3, "thumbnail");

            console.log("Fetching thumbnail data...");
            const thumbnailResponse = await axios.get(tempThumbnailUrl, { responseType: "arraybuffer", timeout: 30000 });
            const thumbnailBuffer = Buffer.from(thumbnailResponse.data);

            console.log("Uploading thumbnail to Cloudinary...");
            const thumbnailUploadResult = await uploadToCloudinaryWithRetry(
                thumbnailBuffer,
                { resource_type: "image" }
            );
            thumbnailUrl = thumbnailUploadResult.secure_url;
            console.log("Uploaded thumbnail URL:", thumbnailUrl);

            sendEvent("firstThumbnail", { url: thumbnailUrl });
        } catch (error) {
            console.error("Error generating or uploading thumbnail:", JSON.stringify(error, null, 2));
            sendEvent("error", { success: false, message: "Failed to generate or upload thumbnail. Please try again later." });
            return res.end();
        }

        completedSteps++;
        estimatedTime = (totalSteps - completedSteps) * initialTimePerStep;
        sendEvent("progress", { percentage: (completedSteps / totalSteps) * 100, estimatedTime });

        // Generate and Upload Other Images
        const imageUrls = [];
        console.log("Starting image generation process...");
        for (let i = 0; i < videoStructure.imagePrompts.length; i++) {
            const { prompt, negativePrompt = "Blurry, low quality, distorted, watermark, text overlay" } = videoStructure.imagePrompts[i];
            const enhancedPrompt = `${prompt}, ${format} orientation, high detail, 4K resolution`;
            const finalNegativePrompt = negativePrompt;

            const params = {
                prompt: enhancedPrompt,
                negative_prompt: finalNegativePrompt,
                seed: 0,
                width: dimensions.width,
                height: dimensions.height,
                prior_num_inference_steps: 20,
                prior_guidance_scale: 4,
                decoder_num_inference_steps: 10,
                decoder_guidance_scale: 1,
                num_images_per_prompt: 1,
            };

            try {
                console.log(`Generating image ${i}...`);
                const imageUrl = await generateWithRetry(client, params, 3, `image ${i}`);

                console.log(`Fetching image ${i} data...`);
                const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer", timeout: 30000 });
                const imageBuffer = Buffer.from(imageResponse.data);

                console.log(`Uploading image ${i} to Cloudinary...`);
                const imageUploadResult = await uploadToCloudinaryWithRetry(
                    imageBuffer,
                    { resource_type: "image" }
                );
                imageUrls.push(imageUploadResult.secure_url);
                console.log(`Uploaded image ${i} URL:`, imageUploadResult.secure_url);
            } catch (error) {
                console.error(`❌ Error generating or uploading image ${i}:`, JSON.stringify(error, null, 2));
                sendEvent("error", { success: false, message: "Failed to generate images. Please try again later." });
                return res.end();
            }

            completedSteps++;
            estimatedTime = (totalSteps - completedSteps) * initialTimePerStep;
            sendEvent("progress", { percentage: (completedSteps / totalSteps) * 100, estimatedTime });
        }

        // Ensure all assets are generated
        if (imageUrls.length < videoStructure.imageCount || !thumbnailUrl) {
            sendEvent("error", { success: false, message: "Incomplete assets generated" });
            return res.end();
        }

        // Save to MongoDB
        const aiCreationData = {
            user: req.user._id,
            platform: videoStructure.platform,
            format: videoStructure.format,
            voiceOverText: voiceOverText,
            gttsLanguage: gttsLanguage,
            seo: {
                title: videoStructure.seo.title,
                description: videoStructure.seo.description,
                keywords: videoStructure.seo.keywords,
                hashtags: videoStructure.seo.hashtags,
                bestTimeToPostIndia: videoStructure.seo.bestTimeToPostIndia,
            },
            audioUrl: audioUrl,
            imageUrls: imageUrls,
            thumbnailUrl: thumbnailUrl,
            videoUrl: null,
        };

        console.log("Saving to MongoDB...");
        const aiCreation = new AICreation(aiCreationData);
        await aiCreation.save();
        console.log("Saved to MongoDB with ID:", aiCreation._id);

        sendEvent("complete", {
            success: true,
            message: "Video structure, audio, thumbnail, images, and SEO generated and saved successfully",
            aiCreation
        });

        res.end();
    } catch (error) {
        console.error("Error in generateVideoStructure:", JSON.stringify(error, null, 2));
        sendEvent("error", { success: false, message: "An unexpected error occurred. Please try again later.", error: error.message });
        res.end();
    }
};

module.exports = {
    generateVideoIdeas,
    generateVideoStructure,
};