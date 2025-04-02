//src/components/Player.jsx

import { useState, useRef, useEffect } from "react";
import styles from "../styles/Player.module.css";

const Player = ({ files }) => {
  const [currentIndex, setCurrentIndex] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (files && files.length > 0 && currentIndex === null) {
      setCurrentIndex(0); // Починаємо відтворення з першого файлу, якщо файли є і індекс не встановлено
    }
  }, [files, currentIndex]);

  useEffect(() => {
    if (currentIndex !== null && files && files.length > 0) {
      const file = files[currentIndex];

      if (!(file instanceof File)) {
        console.error("Недійсний формат файлу", file);
        return;
      }

      if (audioRef.current.src) {
        URL.revokeObjectURL(audioRef.current.src);
      }

      const url = URL.createObjectURL(file);
      audioRef.current.src = url;
      audioRef.current.load();

      audioRef.current.play().catch((err) => {
        console.warn("Автоматичне відтворення не вдалося:", err);
      });

      if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: file.name,
          artist: "Невідомий виконавець",
          artwork: [{ src: "/icon-512.webp", sizes: "512x512", type: "image/webp" }],
        });

        navigator.mediaSession.setActionHandler("play", () => audioRef.current.play());
        navigator.mediaSession.setActionHandler("pause", () => audioRef.current.pause());
        navigator.mediaSession.setActionHandler("previoustrack", playPrevious);
        navigator.mediaSession.setActionHandler("nexttrack", playNext);
      }
    }
  }, [currentIndex, files]);

  const playNext = () => {
    if (files && files.length > 0) {
      setCurrentIndex((prev) => (prev === null ? 0 : (prev + 1) % files.length));
    }
  };

  const playPrevious = () => {
    if (files && files.length > 0) {
      setCurrentIndex((prev) => (prev === null ? files.length - 1 : (prev - 1 + files.length) % files.length));
    }
  };

  const playTrack = (index) => {
    setCurrentIndex(index);
  };

  const handleAudioEnd = () => {
    playNext();
  };

  return (
    <div className={styles.playerContainer}>
      <audio ref={audioRef} controls onEnded={handleAudioEnd} />
      <div className={styles.audioControls}>
        <button onClick={playPrevious} disabled={!files || files.length === 0}>Попередній</button>
        <button onClick={playNext} disabled={!files || files.length === 0}>Наступний</button>
      </div>
      <ul className={styles.trackList}>
        {files && files.map((file, index) => (
          <li
            key={index}
            onClick={() => playTrack(index)}
            className={`${styles.trackItem} ${index === currentIndex ? styles.trackItemActive : ""}`}
          >
            <span className={styles.trackName}>{file.name}</span>
          </li>
        ))}
      </ul>
      <p>{files && files.length > 0 && currentIndex !== null ? files[currentIndex]?.name : "Файл не вибрано"}</p>
    </div>
  );
};

export default Player;
