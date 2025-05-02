// src/pages/index.js
import { useState, useEffect } from "react";
import FilePicker from "../components/FilePicker";
import Player from "../components/Player";
import styles from "../styles/Home.module.css";
import { loadPlaylist } from "../lib/db";
import { parseBlob } from 'music-metadata';

export default function Home() {
  const [files, setFiles] = useState([]);
  const [tracks, setTracks] = useState([]); // Містить об'єкти з { file, metadata }

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

  const handleFilesSelected = async (selectedFiles) => {
    setFiles(selectedFiles); // ДОДАЙТЕ ЦЕ
  
    const parsedTracks = await Promise.all(
      selectedFiles.map(async (file) => {
        try {
          const metadata = await parseBlob(file);
          return { file, metadata };
        } catch (error) {
          console.error("Не вдалося прочитати метадані для", file.name);
          return { file, metadata: {} };
        }
      })
    );
    setTracks(parsedTracks);
  };

  return (
    <div>
      <div className={styles.wrapper}>
      <h1 className={styles.title}>PWA Player</h1>
      <FilePicker onFilesSelected={handleFilesSelected} />
      </div>
      {files.length > 0 && <Player files={files} />}
    </div>
  );
}
