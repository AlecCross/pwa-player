//src/components/Player.jsx

import { useState, useRef, useEffect } from "react";
import styles from "../styles/Player.module.css";
import { parseBlob } from "music-metadata";
import useNaturalSort from "../hooks/useNaturalSort";

const Player = ({ files }) => {
    const [currentIndex, setCurrentIndex] = useState(null);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadedCount, setLoadedCount] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [currentLoadingTrackName, setCurrentLoadingTrackName] = useState("");

    const naturalSort = useNaturalSort();

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${minutes}:${remainingSeconds}`; // Повертаємо відформатований час
    };

    const [volume, setVolume] = useState(1); // Початкова гучність 1 (максимальна)
    const [isMuted, setIsMuted] = useState(false);

    const handleVolumeChange = (event) => {
        const newVolume = parseFloat(event.target.value);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
        }
    };

    const playNext = () => {
        console.log("playNext викликано, поточний currentIndex:", currentIndex);
        if (!tracks?.length) return;
        const nextIndex = (currentIndex === null ? 0 : (currentIndex + 1) % tracks.length);
        console.log("playNext: новий індекс:", nextIndex);
        setCurrentIndex(nextIndex);
        console.log("playNext: currentIndex оновлено на:", nextIndex);
    };

    const playPrevious = () => {
        console.log("playPrevious викликано, поточний currentIndex:", currentIndex);
        if (!tracks?.length) return;
        const prevIndex = (currentIndex === null ? tracks.length - 1 : (currentIndex - 1 + tracks.length) % tracks.length);
        console.log("playPrevious: новий індекс:", prevIndex);
        setCurrentIndex(prevIndex);
        console.log("playPrevious: currentIndex оновлено на:", prevIndex);
    };

    const handlePlay = () => {
        console.log("handlePlay викликано, isPlaying:", isPlaying);
        if (audioRef.current) {
            audioRef.current.play();
            setIsPlaying(true);
            if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing";
        }
    };

    const handlePause = () => {
        console.log("handlePause викликано, isPlaying:", isPlaying);
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
            if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
        }
    };

    const setMediaSessionMetadata = (track) => {
        if ("mediaSession" in navigator && track?.metadata) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: track.metadata.title || track.file.name,
                artist: track.metadata.artist || "Невідомий виконавець",
                album: track.metadata.album || "",
                artwork: [{ src: track.metadata.pictureUrl || "/icon-512.webp", sizes: "512x512", type: "image/png" }],
            });
        } else if ("mediaSession" in navigator && track) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: track.file.name,
                artist: "Невідомий виконавець",
                album: "",
                artwork: [{ src: "/icon-512.webp", sizes: "512x512", type: "image/png" }],
            });
        }
    };

    const handleTimelineChange = (event) => {
        if (audioRef.current) {
            audioRef.current.currentTime = parseFloat(event.target.value);
            setCurrentTime(parseFloat(event.target.value)); // Оновлюємо локальний стан
        }
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            setDuration(audio.duration || 0);

            if (
                'mediaSession' in navigator &&
                typeof navigator.mediaSession.setPositionState === 'function' &&
                !isNaN(audio.duration) &&
                audio.readyState >= 1
            ) {
                try {
                    navigator.mediaSession.setPositionState({
                        duration: audio.duration,
                        playbackRate: audio.playbackRate || 1.0,
                        position: audio.currentTime,
                    });
                } catch (error) {
                    console.warn("setPositionState error:", error);
                }
            }
        };

        audio.addEventListener("timeupdate", handleTimeUpdate);
        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
        };
    }, []);


    useEffect(() => {
        if ("mediaSession" in navigator) {
            navigator.mediaSession.setActionHandler("play", () => {
                console.log("MediaSession: play викликано");
                handlePlay();
                setIsPlaying(true);
                console.log("MediaSession: стан isPlaying оновлено на true");
            });
            navigator.mediaSession.setActionHandler("pause", () => {
                console.log("MediaSession: pause викликано");
                handlePause();
                setIsPlaying(false);
                console.log("MediaSession: стан isPlaying оновлено на false");
            });
            navigator.mediaSession.setActionHandler("previoustrack", () => {
                console.log("MediaSession: previoustrack викликано");
                playPrevious();
            });
            navigator.mediaSession.setActionHandler("nexttrack", () => {
                console.log("MediaSession: nexttrack викликано");
                playNext();
            });
        }
    }, [playNext, playPrevious, handlePlay, handlePause, setIsPlaying]);// Додайте setIsPlaying до залежностей

    useEffect(() => {
        if (!files?.length) return;

        const processFiles = async () => {
            setLoading(true);
            setLoadedCount(1);
            setTotalCount(files.length);
            const processedTracks = [];

            for (const file of files) {
                setCurrentLoadingTrackName(file.name);
                let metadata = {
                    title: file.name,
                    artist: "Невідомий виконавець",
                    album: "",
                    pictureUrl: "/icon-512.webp",
                };

                try {
                    const result = await parseBlob(file);
                    metadata.title = result.common.title || file.name;
                    metadata.artist = result.common.artist || "Невідомий виконавець";
                    metadata.album = result.common.album || "";
                    if (result.common.picture?.[0]) {
                        const pic = result.common.picture[0];
                        const blob = new Blob([pic.data], { type: pic.format });
                        metadata.pictureUrl = URL.createObjectURL(blob);
                    }
                    metadata.trackNumber = result.common.track?.no ?? null;
                } catch (err) {
                    console.warn("Не вдалося зчитати теги для", file.name, err);
                }
                processedTracks.push({ file, metadata });
                setLoadedCount((prevCount) => prevCount + 1);
            }

            setLoading(false);

            const sortedTracks = [...processedTracks].sort((a, b) => {
                const trackA = a.metadata.trackNumber;
                const trackB = b.metadata.trackNumber;
        
                console.log(`Порівняння: "${a.file.name}" (track: <span class="math-inline">\{trackA\}\) vs "</span>{b.file.name}" (track: ${trackB})`);
        
                if (trackA != null && trackB != null) {
                    const numA = parseInt(trackA, 10);
                    const numB = parseInt(trackB, 10);
                    if (!isNaN(numA) && !isNaN(numB)) {
                        const result = numA - numB;
                        console.log(`  Числове порівняння trackNumber: ${numA} - ${numB} = ${result}`);
                        return result;
                    }
                    const stringResult = String(trackA).localeCompare(String(trackB), undefined, { numeric: true, sensitivity: 'base' });
                    console.log(`  Рядкове порівняння trackNumber: "<span class="math-inline">\{trackA\}" vs "</span>{trackB}" = ${stringResult}`);
                    return stringResult;
                }
        
                const naturalSortResult = naturalSort(a.file.name, b.file.name); // Використання функції з хука
                console.log(`  Natural sort (один або обидва без trackNumber): "<span class="math-inline">\{a\.file\.name\}" vs "</span>{b.file.name}" = ${naturalSortResult}`);
                return naturalSortResult;
            });

            console.log("Відсортований масив sortedTracks:", sortedTracks.map(item => ({ name: item.file.name, track: item.metadata.trackNumber })));
            setTracks(sortedTracks);
            setCurrentIndex(0);
        };

        processFiles();
    }, [files]);

    useEffect(() => {
        if (tracks?.length && currentIndex !== null) {
            const newTrack = tracks[currentIndex];
            setCurrentTrack(newTrack);
            setMediaSessionMetadata(newTrack);
        }
    }, [currentIndex, tracks]);

    useEffect(() => {
        if (!currentTrack) return;
        const file = currentTrack.file;

        if (!(file instanceof File)) return console.error("Недійсний файл:", file);

        console.log("useEffect для currentTrack, файл:", file.name);

        if (audioRef.current?.src) URL.revokeObjectURL(audioRef.current.src);

        const url = URL.createObjectURL(file);
        audioRef.current.src = url;
        audioRef.current.load();
        audioRef.current.play()
            .then(() => {
                setIsPlaying(true);
                if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing";
            })
            .catch((err) => {
                console.warn("Автоматичне відтворення не вдалося:", err);
                setIsPlaying(false);
                if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
            });
    }, [currentTrack]);

    const handleAudioEnd = () => playNext(); // Визначення функції handleAudioEnd

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.volume = volume; // Застосовуємо початкову гучність
    
            const onLoadedMetadata = () => setDuration(audio.duration);
            const onPlay = () => setIsPlaying(true);
            const onPause = () => setIsPlaying(false);
            const onSeeked = () => {};
    
            audio.addEventListener("loadedmetadata", onLoadedMetadata);
            audio.addEventListener("play", onPlay);
            audio.addEventListener("pause", onPause);
            audio.addEventListener("ended", handleAudioEnd);
            audio.addEventListener("seeked", onSeeked);
    
            return () => {
                audio.removeEventListener("loadedmetadata", onLoadedMetadata);
                audio.removeEventListener("play", onPlay);
                audio.removeEventListener("pause", onPause);
                audio.removeEventListener("ended", handleAudioEnd);
                audio.removeEventListener("seeked", onSeeked);
            };
        }
    }, [handleAudioEnd, volume]);

    return (
        <div className={styles.playerContainer}>
            <div className={styles.playerHeader}>
                <img src={currentTrack?.metadata?.pictureUrl || "/icon-512.webp"} alt="Обкладинка" className={styles.coverArt} />
                <div className={styles.metadata}>
                    <strong className={styles.title}>{currentTrack?.metadata?.title || currentTrack?.file?.name || ""}</strong>
                    <p className={styles.subtitle}>
                        {currentTrack?.metadata?.artist || "Невідомий виконавець"}
                        {currentTrack?.metadata?.album ? ` — ${currentTrack.metadata.album}` : ""}
                    </p>
                    <div className={styles.audioControls}>
                        <button onClick={playPrevious} disabled={!tracks?.length}>⏮</button>
                        <button onClick={playNext} disabled={!tracks?.length}>⏭</button>
                        <button onClick={isPlaying ? handlePause : handlePlay}>
                            {isPlaying ? "⏸" : "▶"}
                        </button>
                        
                    </div>
                    <div className={styles.volumeControlContainer}>
                        <button onClick={toggleMute}>
                            {isMuted ? "🔇" : "🔊"}
                        </button>
                        <div className={styles.volumeSliderWrapper}>
                            <input
                                type="range"
                                className={styles.volumeSlider}
                                value={volume}
                                min="0"
                                max="1"
                                step="0.01"
                                onChange={handleVolumeChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.timelineContainer}>
                <span className={styles.timeDisplay}>{formatTime(currentTime)}</span> 
                <input
                    type="range"
                    className={styles.timeline}
                    value={currentTime}
                    min="0"
                    max={duration}
                    onChange={handleTimelineChange}
                />    
                <span className={styles.timeDisplay}>{formatTime(duration)}</span>
            </div>
            <audio ref={audioRef} onEnded={handleAudioEnd} className={styles.audioElement} />
            <ul className={styles.trackList}>
                {loading ? (
                    <li className={styles.loadingItem}>
                        <span className={styles.loadingTrackName}>{currentLoadingTrackName}</span>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressBarFill}
                                style={{ width: `${(loadedCount / totalCount) * 100}%` }}
                            ></div>
                        </div>
                        <span className={styles.loadingProgressText}>
                            {loadedCount}/{totalCount}
                        </span>
                    </li>
                ) : (
                    tracks?.map((track, index) => (
                        <li
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`${styles.trackItem} ${index === currentIndex ? styles.trackItemActive : ""}`}
                        >
                            <span className={styles.trackName}>{track.file.name}</span>
                        </li>
                    ))
                )}
            </ul>
            {loading && (
                <div className={styles.loadingInfo}>
                    Обробка: {currentLoadingTrackName} ({loadedCount}/{totalCount})
                </div>
            )}
        </div>
    );
};

export default Player;
  