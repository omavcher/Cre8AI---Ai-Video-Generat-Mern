import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Img, Sequence, Audio, interpolate, useCurrentFrame } from 'remotion';

function RemotionVideo({ audioUrl, imageUrls, subtitles, gttsLanguage, voiceOverText }) {
    const [duration, setDuration] = useState(300);
    const frame = useCurrentFrame();

    useEffect(() => {
        const getDuration = async () => {
            try {
                const audio = new window.Audio(audioUrl);
                audio.onloadedmetadata = () => {
                    setDuration(Math.ceil(audio.duration * 30)); 
                };
                audio.preload = 'metadata';
                await audio.load();
            } catch (error) {
                console.error('Error getting audio duration:', error);
                setDuration(300); 
            }
        };
        if (audioUrl) getDuration();
    }, [audioUrl]);

    const imageCount = imageUrls?.length || 1;
    const durationPerImage = Math.floor(duration / imageCount);

    const ZoomImage = ({ src, sequenceDuration }) => {
        const zoom = interpolate(
            frame % sequenceDuration,
            [0, sequenceDuration * 0.5, sequenceDuration],
            [1, 1.1, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: t => t * t * (3 - 2 * t) }
        );

        const opacity = interpolate(
            frame % sequenceDuration,
            [0, 15, sequenceDuration - 15, sequenceDuration],
            [0, 1, 1, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        const activeSubtitle = subtitles.find(
            sub => frame >= sub.startFrame && frame <= sub.endFrame
        );

        const subtitleAnimation = (subtitle) => {
            if (!subtitle) return { opacity: 0, translateY: 0 };

            const timeInSubtitle = frame - subtitle.startFrame;
            const durationInFrames = subtitle.endFrame - subtitle.startFrame;

            const minDuration = 30; 
            const effectiveDuration = Math.max(durationInFrames, minDuration);

            const fadeDuration = Math.min(15, Math.floor(effectiveDuration / 3)); 

            const fadeOutStart = effectiveDuration - fadeDuration;
            const inputRange = [0, fadeDuration, fadeOutStart, effectiveDuration];

            const opacity = interpolate(
                timeInSubtitle,
                inputRange,
                [0, 1, 1, 0],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );

            const translateY = interpolate(
                timeInSubtitle,
                [0, fadeDuration],
                [20, 0],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: t => t * t * (3 - 2 * t) }
            );

            return { opacity, translateY };
        };

        const { opacity: subOpacity, translateY } = subtitleAnimation(activeSubtitle);

        return (
            <>
                <Img
                    src={src}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: `scale(${zoom})`,
                        opacity: opacity,
                    }}
                />
                {activeSubtitle && (
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '10%',
                            left: '50%',
                            transform: `translateX(-50%) translateY(${translateY}px)`,
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            fontSize: '24px',
                            textAlign: 'center',
                            maxWidth: '80%',
                            opacity: subOpacity,
                            transition: 'opacity 0.3s ease-in-out', 
                        }}
                    >
                        {activeSubtitle.text}
                    </div>
                )}
            </>
        );
    };

    return (
        <AbsoluteFill style={{ backgroundColor: 'white' ,}}>
            <Audio src={audioUrl} />
            {imageUrls?.map((item, index) => {
                const startFrame = index * durationPerImage;
                return (
                    <Sequence
                        key={index}
                        from={startFrame}
                        durationInFrames={durationPerImage}
                    >
                        <ZoomImage 
                            src={item}
                            sequenceDuration={durationPerImage}
                        />
                    </Sequence>
                );
            })}
        </AbsoluteFill>
    );
}

export default RemotionVideo;