//src/components/Player.jsx

import { useState, useRef, useEffect } from "react";
import styles from "../styles/Player.module.css";
import { parseBlob } from "music-metadata";

const Player = ({ files }) => {
  const [currentIndex, setCurrentIndex] = useState(null);
  const [metadata, setMetadata] = useState({
    title: "",
    artist: "",
    album: "",
    pictureUrl: "/icon-512.webp",
  });
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const playNext = () => {
    if (!files?.length) return;
    setCurrentIndex((prev) => (prev === null ? 0 : (prev + 1) % files.length));
  };

  const playPrevious = () => {
    if (!files?.length) return;
    setCurrentIndex((prev) =>
      prev === null ? files.length - 1 : (prev - 1 + files.length) % files.length
    );
  };

  const setMediaSessionMetadata = ({ title, artist, album, pictureUrl }) => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title,
        artist,
        album,
        artwork: [{ src: pictureUrl, sizes: "512x512", type: "image/png" }],
      });

      navigator.mediaSession.setActionHandler("play", () => audioRef.current?.play());
      navigator.mediaSession.setActionHandler("pause", () => audioRef.current?.pause());
      navigator.mediaSession.setActionHandler("previoustrack", playPrevious);
      navigator.mediaSession.setActionHandler("nexttrack", playNext);
    }
  };

  // Ініціалізація аудіо подій
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => setDuration(audio.duration);
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);

      if (
        "mediaSession" in navigator &&
        typeof navigator.mediaSession.setPositionState === "function" &&
        !isNaN(audio.duration) &&
        audio.readyState >= 1
      ) {
        try {
          navigator.mediaSession.setPositionState({
            duration: audio.duration,
            playbackRate: audio.playbackRate,
            position: audio.currentTime,
          });
        } catch (e) {
          console.warn("setPositionState error:", e);
        }
      }
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, []);

  // Почати з першого треку
  useEffect(() => {
    if (files?.length && currentIndex === null) {
      setCurrentIndex(0);
    }
  }, [files, currentIndex]);

  // Завантаження треку
  useEffect(() => {
    if (currentIndex === null || !files?.length) return;
    const file = files[currentIndex];

    if (!(file instanceof File)) return console.error("Недійсний файл:", file);

    if (audioRef.current?.src) URL.revokeObjectURL(audioRef.current.src);

    const url = URL.createObjectURL(file);
    const audio = audioRef.current;
    audio.src = url;
    audio.load();
    audio.play().catch((err) => {
      console.warn("Автовідтворення не вдалося:", err);
    });

    // fallback metadata
    setMediaSessionMetadata({
      title: file.name,
      artist: "Невідомий виконавець",
      album: "",
      pictureUrl: "/icon-512.webp",
    });
  }, [currentIndex, files]);

  // Зчитування метаданих з треку
  useEffect(() => {
    const readMetadata = async () => {
      if (currentIndex === null || !files?.length) return;
      const file = files[currentIndex];

      try {
        const result = await parseBlob(file);
        const title = result.common.title || file.name;
        const artist = result.common.artist || "Невідомий виконавець";
        const album = result.common.album || "";

        let pictureUrl = "/icon-512.webp";
        if (result.common.picture?.[0]) {
          const pic = result.common.picture[0];
          const blob = new Blob([pic.data], { type: pic.format });
          pictureUrl = URL.createObjectURL(blob);
        }

        const meta = { title, artist, album, pictureUrl };
        setMetadata(meta);
        setMediaSessionMetadata(meta);
      } catch (err) {
        console.error("Помилка зчитування метаданих:", err);
        const fallback = {
          title: file.name,
          artist: "Невідомий",
          album: "",
          pictureUrl: "/icon-512.webp",
        };
        setMetadata(fallback);
        setMediaSessionMetadata(fallback);
      }
    };

    readMetadata();
  }, [currentIndex, files]);

  const handleAudioEnd = () => playNext();

  return (
    <div className={styles.playerContainer}>
      <div className={styles.playerHeader}>
        <img src={metadata.pictureUrl} alt="Обкладинка" className={styles.coverArt} />
        <div className={styles.metadata}>
          <strong className={styles.title}>{metadata.title}</strong>
          <p className={styles.subtitle}>
            {metadata.artist}
            {metadata.album ? ` — ${metadata.album}` : ""}
          </p>
          <div className={styles.audioControls}>
            <button onClick={playPrevious} disabled={!files?.length}>⏮</button>
            <button onClick={playNext} disabled={!files?.length}>⏭</button>
          </div>
        </div>
      </div>

      <audio ref={audioRef} controls onEnded={handleAudioEnd} className={styles.audioElement} />

      <ul className={styles.trackList}>
        {files?.map((file, index) => (
          <li
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`${styles.trackItem} ${index === currentIndex ? styles.trackItemActive : ""}`}
          >
            <span className={styles.trackName}>{file.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Player;
