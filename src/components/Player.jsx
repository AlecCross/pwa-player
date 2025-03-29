import { useState, useRef, useEffect } from "react";
import styles from "../styles/Player.module.css";

const Player = ({ files }) => {
  const [currentIndex, setCurrentIndex] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (currentIndex !== null && files.length > 0) {
      const file = files[currentIndex];
  
      // Перевірка типу файлу
      if (!(file instanceof File)) {
        console.error("Invalid file format", file);
        return;
      }
  
      // Очистка попереднього URL (щоб уникнути витоку пам’яті)
      if (audioRef.current.src) {
        URL.revokeObjectURL(audioRef.current.src);
      }
  
      // Створення нового URL
      const url = URL.createObjectURL(file);
      audioRef.current.src = url;
      audioRef.current.load();
  
      // Обробка можливих помилок при відтворенні
      audioRef.current.play().catch((err) => {
        console.warn("Autoplay failed:", err);
      });
  
      // Оновлення Media Session API
      if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: file.name,
          artist: "Unknown Artist",
          artwork: [{ src: "/icon-512.webp", sizes: "512x512", type: "image/webp" }]
        });
  
        navigator.mediaSession.setActionHandler("play", () => audioRef.current.play());
        navigator.mediaSession.setActionHandler("pause", () => audioRef.current.pause());
        navigator.mediaSession.setActionHandler("previoustrack", playPrevious);
        navigator.mediaSession.setActionHandler("nexttrack", playNext);
      }
    }
  }, [currentIndex, files]);
  
  const playNext = () => {
    setCurrentIndex((prev) => (prev === null ? 0 : (prev + 1) % files.length));
  };

  const playPrevious = () => {
    setCurrentIndex((prev) => (prev === null ? files.length - 1 : (prev - 1 + files.length) % files.length));
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
        <button onClick={playPrevious} disabled={files.length === 0}>Попередній</button>
        <button onClick={playNext} disabled={files.length === 0}>Наступний</button>
      </div>
      <ul className={styles.trackList}>
        {files.map((file, index) => (
          <li
            key={index}
            onClick={() => playTrack(index)}
            className={`${styles.trackItem} ${index === currentIndex ? styles.trackItemActive : ""}`}
          >
            <span className={styles.trackName}>{file.name}</span>
          </li>
        ))}
      </ul>
      <p>{files.length > 0 && currentIndex !== null ? files[currentIndex]?.name : "Файл не вибрано"}</p>
    </div>
  );
};

export default Player;
