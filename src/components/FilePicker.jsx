import { useState } from "react";
import styles from '../styles/FilePicker.module.css'

const FilePicker = ({ onFilesSelected }) => {
  const [files, setFiles] = useState([]);

  // Функція для вибору папки та фільтрації аудіофайлів
  const selectFolder = async () => {
    try {
      const directoryHandle = await window.showDirectoryPicker();
      const audioFiles = [];

      for await (const entry of directoryHandle.values()) {
        if (entry.kind === "file") {
          const file = await entry.getFile();
          
          // Фільтруємо тільки аудіофайли за MIME-типом або розширенням
          if (file.type.startsWith("audio/") || /\.(mp3|wav|flac|ogg)$/i.test(file.name)) {
            audioFiles.push(file);
          }
        }
      }

      setFiles(audioFiles); // Оновлюємо стан тільки аудіофайлами
      onFilesSelected(audioFiles); // Передаємо файли у Player

    } catch (error) {
      console.error("Помилка вибору папки:", error);
    }
  };

  return (
    <div className={styles.wrapper}>
      <button className={styles.button} onClick={selectFolder}>Обрати папку</button>
      {/* <ul>
        {files.map((file, index) => (
          <li key={index}>{file.name}</li>
        ))}
      </ul> */}
    </div>
  );
};

export default FilePicker;
