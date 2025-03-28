import { useState, useRef, useEffect } from "react";
import styles from "../styles/Player.module.css"; // Імпортуємо стилі

const Player = ({ files }) => {
  const [currentIndex, setCurrentIndex] = useState(null); // Початково немає вибраного треку
  const audioRef = useRef(null);

  // Завантаження і відтворення треку після зміни індексу
  useEffect(() => {
    if (currentIndex !== null && files.length > 0) {
      audioRef.current.src = URL.createObjectURL(files[currentIndex]);
      audioRef.current.load();  // Завантажуємо новий файл перед відтворенням
      audioRef.current.play();  // Автоматично запускаємо відтворення
    }
  }, [currentIndex, files]);

  // Функція для відтворення наступного треку
  const playNext = () => {
    setCurrentIndex((prev) => (prev + 1) % files.length); // Циклічне перемикання
  };

  // Функція для відтворення попереднього треку
  const playPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + files.length) % files.length); // Циклічне перемикання
  };

  // Встановлення вибраного треку
  const playTrack = (index) => {
    setCurrentIndex(index); // Встановлюємо індекс обраного треку і починаємо відтворення
  };

  // Обробка завершення треку
  const handleAudioEnd = () => {
    playNext(); // Переходимо до наступного треку після завершення поточного
  };

  return (
    <div className={styles.playerContainer}>
      <audio
        ref={audioRef}
        controls
        onEnded={handleAudioEnd}  // Викликаємо функцію після завершення треку
      />
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
  