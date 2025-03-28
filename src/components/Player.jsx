import { useState, useRef, useEffect } from "react";
import styles from "../styles/Player.module.css"; // Імпортуємо стилі

const Player = ({ files }) => {
  const [currentIndex, setCurrentIndex] = useState(null); // Початково немає вибраного треку
  const audioRef = useRef(null);

  useEffect(() => {
    if (currentIndex !== null && files.length > 0) {
      // Якщо індекс вибраний, завантажуємо трек і відтворюємо
      audioRef.current.src = URL.createObjectURL(files[currentIndex]);
      audioRef.current.load();  // Завантажуємо новий файл перед відтворенням
      audioRef.current.play();  // Автоматично запускаємо відтворення
    }
  }, [currentIndex, files]);

  const playNext = () => {
    setCurrentIndex((prev) => (prev + 1) % files.length);
  };

  const playPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + files.length) % files.length);
  };

  const playTrack = (index) => {
    setCurrentIndex(index); // Встановлюємо індекс обраного треку і починаємо відтворення
  };

  return (
    <div className={styles.playerContainer}>
      <audio ref={audioRef} controls />
      <div className={styles.audioControls}>
        <button onClick={playPrevious} disabled={files.length === 0}>
          Попередній
        </button>
        <button onClick={playNext} disabled={files.length === 0}>
          Наступний
        </button>
      </div>

      {/* Виведення списку треків */}
      <ul className={styles.trackList}>
        {files.map((file, index) => (
          <li
            key={index}
            onClick={() => playTrack(index)}  // Вибір треку
            className={`${styles.trackItem} ${index === currentIndex ? styles.trackItemActive : ""}`}
          >
            <span className={styles.trackName}>{file.name}</span>
          </li>
        ))}
      </ul>

      <p>{files.length > 0 ? files[currentIndex]?.name : "Файл не вибрано"}</p>
    </div>
  );
};

export default Player;
