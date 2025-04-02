//src/components/FilePicker.jsx

import { useState } from "react";
import styles from '../styles/FilePicker.module.css';
import { savePlaylist } from '../lib/db';

const FilePicker = ({ onFilesSelected }) => {
  const [files, setFiles] = useState([]);

  const selectFolder = async () => {
    try {
      const directoryHandle = await window.showDirectoryPicker();
      console.log("directoryHandle:", directoryHandle);
      const audioFilesWithHandles = [];
      const audioFiles = [];

      for await (const entry of directoryHandle.values()) {
        if (entry.kind === "file") {
          const file = await entry.getFile();
          if (file.type.startsWith("audio/") || /\.(mp3|wav|flac|ogg)$/i.test(file.name)) {
            audioFiles.push(file);
            audioFilesWithHandles.push({ name: file.name, type: file.type, handle: entry });
          }
        }
      }

      console.log("audioFilesWithHandles:", audioFilesWithHandles);
      setFiles(audioFiles);
      onFilesSelected(audioFiles);

      console.log("Викликаємо savePlaylist...");
      await savePlaylist(directoryHandle.name, audioFilesWithHandles);
      console.log("savePlaylist завершено.");

    } catch (error) {
      console.error("Помилка вибору папки:", error);
    }
  };

  return (
    <div className={styles.wrapper}>
      <button className={styles.button} onClick={selectFolder}>Обрати папку</button>
      {/* ... */}
    </div>
  );
};

export default FilePicker;
