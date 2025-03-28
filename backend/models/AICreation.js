const mongoose = require("mongoose");

const aiCreationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    platform: { type: String, required: true },
    format: { type: String, required: true },
    seo: {
        title: { type: String, required: true },
        description: { type: String, required: true },
        keywords: [{ type: String }],
        hashtags: [{ type: String }],
        bestTimeToPostIndia: { type: String },
    },
    gttsLanguage: { type: String }, 
    audioUrl: { type: String, required: true },
    imageUrls: [{ type: String }],
    thumbnailUrl: { type: String },
    videoUrl: { type: String },
    voiceOverText: {type: String},
    rating: { type: Number , default: null},
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AICreation", aiCreationSchema);
