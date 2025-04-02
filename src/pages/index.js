// src/pages/index.js
import { useState, useEffect } from "react";
import FilePicker from "../components/FilePicker";
import Player from "../components/Player";
import styles from "../styles/Home.module.css";
import { loadPlaylist } from "../lib/db";

export default function Home() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const loadSavedPlaylist = async () => {
      console.log("loadSavedPlaylist викликано"); // Перевірка виклику функції
      const savedPlaylist = await loadPlaylist();
      console.log("Результат loadPlaylist:", savedPlaylist); // Перевірка результату loadPlaylist

      if (savedPlaylist && savedPlaylist.filesWithHandles) {
        console.log("Завантажені файли з IndexedDB:", savedPlaylist.filesWithHandles);
        const loadedFiles = await Promise.all(
          savedPlaylist.filesWithHandles.map(async (fileWithHandle) => {
            if (fileWithHandle.handle) {
              try {
                const file = await fileWithHandle.handle.getFile();
                return file;
              } catch (error) {
                console.error("Помилка отримання File з handle:", error);
                return null;
              }
            }
            return null;
          })
        ).then(files => files.filter(file => file !== null));
        console.log("Завантажені об'єкти File:", loadedFiles);
        setFiles(loadedFiles);
        console.log("Стан files оновлено:", files);
      } else {
        console.log("Немає збереженого плейлиста або filesWithHandles порожній");
      }
    };

    loadSavedPlaylist();
  }, []);

  const handleFilesSelected = (selectedFiles) => {
    setFiles(selectedFiles);
  };

  return (
    <div>
      <h1 className={styles.title}>PWA Музичний плеєр</h1>
      <FilePicker onFilesSelected={handleFilesSelected} />
      {files.length > 0 && <Player files={files} />}
    </div>
  );
}
