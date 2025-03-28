import React, { useState, useEffect, useRef } from "react";
import {
  Youtube,
  Instagram,
  Facebook,
  Linkedin,
  Music,
  Volume2,
  Square,
  Smartphone,
  Monitor,
  Loader2,
  ChevronDown,
  Sparkles,
  Play,
  Pause,
  X,
  Clock,
  AlertTriangle,
} from "lucide-react";
import "./CreateContent.css";
import axios from "axios";
import { BASE_URL } from "../config/api";
import PlayerDialog from "../components/PlayerDialog";

const CreateContent = () => {
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [ideaText, setIdeaText] = useState("");
  const [error, setError] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [selectedVoiceType, setSelectedVoiceType] = useState("male1");
  const [backgroundMusic, setBackgroundMusic] = useState(true);
  const [selectedVideoEffect, setSelectedVideoEffect] = useState("Fade");
  const [processingVideo, setProcessingVideo] = useState(null);
  const [playVideo, setPlayVideo] = useState(false);
  const [videoId, setVideoId] = useState();
  const [isPaused, setIsPaused] = useState(false);
  const topRef = useRef(null);
  const abortControllerRef = useRef(null);

  const platforms = [
    { id: "youtube", name: "YouTube", icon: Youtube },
    { id: "instagram", name: "Instagram Reels", icon: Instagram },
    { id: "tiktok", name: "TikTok", icon: Smartphone },
    { id: "facebook", name: "Facebook", icon: Facebook },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin },
  ];

  const aspectRatios = [
    { id: "square", name: "Square (1:1)", icon: Square, description: "Perfect for Instagram & Facebook" },
    { id: "vertical", name: "Vertical (9:16)", icon: Smartphone, description: "Ideal for TikTok & Reels" },
    { id: "landscape", name: "Landscape (16:9)", icon: Monitor, description: "Best for YouTube" },
  ];

  const videoEffects = ["Fade", "Zoom", "Pan", "None"];

  const resolutionMap = {
    square: "512x512",
    vertical: "512x910",
    landscape: "910x512",
  };

  // Add useEffect to auto-scroll to top when processing starts
  useEffect(() => {
    if (processingVideo && topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [processingVideo]);

  const handleGetSuggestions = async () => {
    try {
      if (!selectedPlatform) {
        setError("Please select a platform first");
        return;
      }

      setError("");
      setIsLoadingSuggestions(true);

      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.token;

      const response = await axios.post(
        `${BASE_URL}/ai/generate-ideas`,
        { platform: selectedPlatform },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );

      if (response.data.success) {
        setSuggestions([response.data.idea]);
        setIdeaText(response.data.idea);
      } else {
        setError(response.data.message || "Failed to get AI suggestions");
      }
    } catch (error) {
      console.error("Error getting suggestions:", error);
      const message = error.response?.data?.message || error.message || "Failed to get AI suggestions";
      if (message.includes("Not authorized")) {
        setError("Please login to use AI suggestions");
      } else {
        setError(message);
      }
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!selectedPlatform || !selectedAspectRatio || !selectedLanguage || !selectedVoiceType || !selectedVideoEffect || !ideaText) {
      setError("Please fill in all required fields: Platform, Format, Language, Voice Type, Video Effect, and Idea.");
      return;
    }

    try {
      setError("");
      setIsGenerating(true);
      abortControllerRef.current = new AbortController();

      setProcessingVideo({
        title: "Generating Video...",
        description: "Starting video generation process...",
        progress: 0,
        timeLeft: "Calculating...",
        thumbnail: null,
        resolution: resolutionMap[selectedAspectRatio],
        status: "processing",
      });

      // Scroll is handled by useEffect now, removed from here
      // topRef.current?.scrollIntoView({ behavior: "smooth" });

      const videoData = {
        platform: selectedPlatform,
        format: selectedAspectRatio,
        language: selectedLanguage,
        voiceType: selectedVoiceType,
        backgroundMusic,
        videoEffects: selectedVideoEffect,
        idea: ideaText,
      };

      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.token;

      const response = await fetch(`${BASE_URL}/ai/generate-video`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify(videoData),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to initiate video generation");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i];
          if (line.startsWith("event:")) {
            const eventType = line.split("\n")[0].replace("event: ", "").trim();
            const dataLine = line.split("\n")[1]?.replace("data: ", "").trim();
            if (dataLine) {
              const data = JSON.parse(dataLine);

              switch (eventType) {
                case "title":
                  setProcessingVideo((prev) => ({ ...prev, title: data.title }));
                  break;
                case "description":
                  setProcessingVideo((prev) => ({ ...prev, description: data.description }));
                  break;
                case "progress":
                  setProcessingVideo((prev) => ({
                    ...prev,
                    progress: data.percentage,
                    timeLeft: `${Math.ceil(data.estimatedTime)}s`,
                  }));
                  break;
                case "firstThumbnail":
                  setProcessingVideo((prev) => ({ ...prev, thumbnail: data.url }));
                  break;
                case "complete":
                  if (data.success) {
                    setProcessingVideo((prev) => ({
                      ...prev,
                      progress: 100,
                      timeLeft: "0s",
                      thumbnail: data.aiCreation.thumbnailUrl || prev.thumbnail,
                      resolution: resolutionMap[selectedAspectRatio],
                      status: "completed",
                    }));


                     console.log(data.aiCreation);
                    setVideoId(data.aiCreation._id);
                    setPlayVideo(true);
                  }
                  setIsGenerating(false);
                  setTimeout(() => setProcessingVideo(null), 5000);
                  break;
                case "error":
                  setError(data.message || "An unexpected error occurred");
                  setProcessingVideo(null);
                  setIsGenerating(false);
                  break;
                default:
                  console.warn(`Unhandled event type: ${eventType}`, data);
              }
            }
          }
        }
        buffer = lines[lines.length - 1];
      }
    } catch (error) {
      if (error.name === "AbortError") {
        setProcessingVideo((prev) => ({ ...prev, status: "cancelled" }));
      } else {
        setError(error.message || "Failed to generate video");
        setProcessingVideo(null);
      }
      setIsGenerating(false);
    }
  };

  const handlePause = () => {
    if (!isPaused) {
      setIsPaused(true);
      setProcessingVideo((prev) => ({ ...prev, status: "paused" }));
    } else {
      setIsPaused(false);
      setProcessingVideo((prev) => ({ ...prev, status: "processing" }));
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setProcessingVideo(null);
    setIsGenerating(false);
    setIsPaused(false);
  };

  return (
    <div className="create-content-fx34">
      <div ref={topRef}></div>

      {processingVideo && (
        <section className="processing-section">
          <div className="processing-content">
            <div className="processing-header">
              <Play className="processing-icon" />
              <h2>Processing: {processingVideo.title}</h2>
            </div>
            <div className="processing-details">
              <div className="processing-thumbnail">
                {processingVideo.thumbnail ? (
                  <img src={processingVideo.thumbnail} alt={processingVideo.title} />
                ) : (
                  <div className="thumbnail-placeholder">Preview</div>
                )}
                <div className="processing-overlay">
                  <div className="processing-status">
                    {processingVideo.status === "processing" && (
                      <>
                        <Loader2 className="spin-icon-fx34" size={24} />
                        <span>Processing</span>
                      </>
                    )}
                    {processingVideo.status === "paused" && <span>Paused</span>}
                    {processingVideo.status === "completed" && (
                      <>
                        <Play size={24} />
                        <span>Completed</span>
                      </>
                    )}
                    {processingVideo.status === "cancelled" && <span>Cancelled</span>}
                  </div>
                </div>
              </div>
              <div className="processing-info">
                <div className="info-group">
                  <h3>{processingVideo.title}</h3>
                  <p>{processingVideo.description}</p>
                </div>
                <div className="progress-wrapper">
                  <div className="progress-container">
                    <div
                      className="progress-bar"
                      style={{ width: `${processingVideo.progress}%` }}
                    />
                  </div>
                  <span className="progress-text">{Math.round(processingVideo.progress)}%</span>
                </div>
                <div className="video-meta">
                  <span><Clock size={14} /> Time Left: {processingVideo.timeLeft}</span>
                  <span>Resolution: {processingVideo.resolution}</span>
                </div>
                <div className="processing-actions">
                  <button
                    className="pause-button"
                    onClick={handlePause}
                    disabled={processingVideo.status === "completed" || processingVideo.status === "cancelled"}
                  >
                    {isPaused ? (
                      <>
                        <Play size={16} />
                        Resume
                      </>
                    ) : (
                      <>
                        <Pause size={16} />
                        Pause
                      </>
                    )}
                  </button>
                  <button
                    className="cancel-button"
                    onClick={handleCancel}
                    disabled={processingVideo.status === "completed" || processingVideo.status === "cancelled"}
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {error && (
        <div className="error-container-fx34">
          <AlertTriangle className="error-icon-fx34" size={24} />
          <p className="error-message-fx34">{error}</p>
          <button className="error-close-fx34" onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {playVideo && videoId && (
        <PlayerDialog playVideo={playVideo} videoId={videoId} />
      )}

      <section className="section-fx34 platform-section-fx34">
        <h2>Choose Platform</h2>
        <div className="platform-grid-fx34">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <button
                key={platform.id}
                className={`platform-card-fx34 ${selectedPlatform === platform.id ? "selected-fx34" : ""}`}
                onClick={() => {
                  setSelectedPlatform(platform.id);
                  setError("");
                }}
              >
                <Icon className="platform-icon-fx34" />
                <span>{platform.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="section-fx34 idea-section-fx34">
        <h2>Enter Your Idea</h2>
        <div className="idea-input-wrapper-fx34">
          <textarea
            className="idea-input-fx34"
            placeholder="Describe your content idea..."
            rows="4"
            value={ideaText}
            onChange={(e) => setIdeaText(e.target.value)}
          />
          <button
            className={`suggestion-button-fx34 ${isLoadingSuggestions ? "loading-fx34" : ""}`}
            onClick={handleGetSuggestions}
            disabled={isLoadingSuggestions}
          >
            {isLoadingSuggestions ? (
              <>
                <Loader2 className="icon-fx34 spin-icon-fx34" />
                Getting Suggestions...
              </>
            ) : (
              <>
                <Sparkles className="icon-fx34" />
                Get AI Suggestions
              </>
            )}
          </button>
        </div>
      </section>

      <section className="section-fx34 aspect-ratio-section-fx34">
        <h2>Choose Video Format</h2>
        <div className="aspect-ratio-grid-fx34">
          {aspectRatios.map((ratio) => {
            const Icon = ratio.icon;
            return (
              <button
                key={ratio.id}
                className={`aspect-ratio-card-fx34 ${selectedAspectRatio === ratio.id ? "selected-fx34" : ""}`}
                onClick={() => {
                  setSelectedAspectRatio(ratio.id);
                  setError("");
                }}
              >
                <Icon className="ratio-icon-fx34" />
                <div className="ratio-info-fx34">
                  <span className="ratio-name-fx34">{ratio.name}</span>
                  <span className="ratio-description-fx34">{ratio.description}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="section-fx34 customization-section-fx34">
        <h2>Customize Your Video</h2>
        <div className="customization-grid-fx34">
          <div className="customization-item-fx34">
            <label>Language</label>
            <div className="select-wrapper-fx34">
              <select
                value={selectedLanguage}
                onChange={(e) => {
                  setSelectedLanguage(e.target.value);
                  setError("");
                }}
              >
                <option value="english">English</option>
                <option value="hindi">Hindi</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="german">German</option>
                <option value="tamil">Tamil</option>
                <option value="telugu">Telugu</option>
              </select>
              <ChevronDown className="select-icon-fx34" />
            </div>
          </div>

          <div className="customization-item-fx34">
            <label>Voice Type</label>
            <div className="select-wrapper-fx34">
              <select
                value={selectedVoiceType}
                onChange={(e) => {
                  setSelectedVoiceType(e.target.value);
                  setError("");
                }}
              >
                <option value="male1">Male Voice 1</option>
                <option value="male2">Male Voice 2</option>
                <option value="female1">Female Voice 1</option>
                <option value="female2">Female Voice 2</option>
                <option value="robotic">AI/Robotic</option>
              </select>
              <ChevronDown className="select-icon-fx34" />
            </div>
          </div>

          <div className="customization-item-fx34">
            <label>Background Music</label>
            <div className="toggle-group-fx34">
              <button
                className={`toggle-button-fx34 ${backgroundMusic ? "active-fx34" : ""}`}
                onClick={() => {
                  setBackgroundMusic(true);
                  setError("");
                }}
              >
                <Music className="icon-fx34" /> On
              </button>
              <button
                className={`toggle-button-fx34 ${!backgroundMusic ? "active-fx34" : ""}`}
                onClick={() => {
                  setBackgroundMusic(false);
                  setError("");
                }}
              >
                <Volume2 className="icon-fx34" /> Off
              </button>
            </div>
          </div>

          <div className="customization-item-fx34">
            <label>Video Effects</label>
            <div className="effects-grid-fx34">
              {videoEffects.map((effect) => (
                <button
                  key={effect}
                  className={`effect-button-fx34 ${selectedVideoEffect === effect ? "active-fx34" : ""}`}
                  onClick={() => {
                    setSelectedVideoEffect(effect);
                    setError("");
                  }}
                >
                  {effect}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <button
        className={`generate-button-fx34 ${isGenerating ? "generating-fx34" : ""}`}
        onClick={handleGenerateVideo}
        disabled={isGenerating || processingVideo}
      >
        {isGenerating ? (
          <>
            <Loader2 className="spin-icon-fx34" />
            Generating Your AI Video...
          </>
        ) : (
          <>Generate the Video</>
        )}
      </button>
    </div>
  );
};

export default CreateContent;