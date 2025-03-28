import React, { useEffect, useState } from 'react';
import './VideoPreviewDialog.css';
import { Player } from "@remotion/player";
import RemotionVideo from '../components/RemotionVideo';
import axios from "axios";
import { BASE_URL } from "../config/api";

function VideoPreviewDialog({ project, onClose }) {
    const [openDialog, setOpenDialog] = useState(true);
    const [videoData, setVideoData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [videoDuration, setVideoDuration] = useState(300);
    const [subtitles, setSubtitles] = useState([]);

    useEffect(() => {
        if (project) {
            setOpenDialog(true);
            fetchVideoData();
        } else {
            setOpenDialog(false);
        }
    }, [project]);

    const fetchVideoData = async () => {
        setIsLoading(true);
        const user = JSON.parse(localStorage.getItem("user"));
        const token = user?.token;

        try {
            const response = await axios.post(
                `${BASE_URL}/video/aicreation`,
                { videoId: project._id },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token ? `Bearer ${token}` : undefined,
                    },
                }
            );

            const tempData = response.data;
            setVideoData(tempData);

            const audio = new Audio(tempData.audioUrl);
            audio.onloadedmetadata = () => {
                const durationInSeconds = audio.duration;
                const durationInFrames = Math.ceil(durationInSeconds * 30);
                setVideoDuration(durationInFrames);
                const generatedSubtitles = generateSubtitlesFromText(tempData.voiceOverText, durationInSeconds);
                setSubtitles(generatedSubtitles);
            };
            audio.preload = 'metadata';
            await audio.load();
        } catch (error) {
            console.error('Error fetching video data:', error);
            setVideoData(null);
            setOpenDialog(false);
        } finally {
            setIsLoading(false);
        }
    };

    const generateSubtitlesFromText = (text, duration) => {
        const sentences = text.split(/[.!?]+/).filter(Boolean).map(s => s.trim() + '.');
        const totalWords = text.split(" ").length;
        const wordsPerSecond = 130 / 60;
        const estimatedTotalDuration = totalWords / wordsPerSecond;
        const scaleFactor = duration / estimatedTotalDuration;

        const subtitles = [];
        let currentTime = 0;

        sentences.forEach((sentence) => {
            const wordCount = sentence.split(" ").length;
            const sentenceDuration = (wordCount / wordsPerSecond) * scaleFactor;

            subtitles.push({
                text: sentence,
                startFrame: Math.floor(currentTime * 30),
                endFrame: Math.floor((currentTime + sentenceDuration) * 30),
            });

            currentTime += sentenceDuration;
        });

        if (subtitles.length > 0) {
            subtitles[subtitles.length - 1].endFrame = Math.min(
                subtitles[subtitles.length - 1].endFrame,
                Math.floor(duration * 30)
            );
        }

        return subtitles;
    };

    const handleClose = () => {
        setOpenDialog(false);
        onClose();
    };

    const handleDownload = () => {
        console.log("download");
    };

    if (!openDialog || isLoading || !project) return null;

    const getDimensions = () => {
        switch (project.format) {
            case 'square':
                return { width: 1080, height: 1080, aspectRatio: '1 / 1' };
            case 'vertical':
                return { width: 1080, height: 1920, aspectRatio: '9 / 16' };
            case 'landscape':
                return { width: 1920, height: 1080, aspectRatio: '16 / 9' };
            default:
                return { width: 1920, height: 1080, aspectRatio: '16 / 9' };
        }
    };

    const { width, height, aspectRatio } = getDimensions();

    return (
        <div className="video-preview-overlay">
            <div className={`video-preview-dialog ${project.format}`}>
                <div className="player-container">
                    {videoData ? (
                        <Player
                            component={RemotionVideo}
                            durationInFrames={videoDuration}
                            compositionWidth={width}
                            compositionHeight={height}
                            fps={30}
                            inputProps={{
                                audioUrl: videoData.audioUrl,
                                imageUrls: videoData.imageUrls,
                                subtitles: subtitles,
                                gttsLanguage: videoData.gttsLanguage,
                                voiceOverText: videoData.voiceOverText,
                            }}
                            acknowledgeRemotionLicense={true}
                            style={{
                                width: '100%',
                                height: 'auto',
                                aspectRatio: aspectRatio,
                            }}
                            controls={true}
                            autoPlay={true}
                            loop={false}
                        />
                    ) : (
                        <p>Failed to load video data.</p>
                    )}
                </div>
                <div className="button-container">
                    <button className="close-button" onClick={handleClose}>
                        Close
                    </button>
                    <button className="download-button" onClick={handleDownload}>
                        Download
                    </button>
                </div>
            </div>
        </div>
    );
}

export default VideoPreviewDialog;