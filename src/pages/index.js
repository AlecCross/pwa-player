// src/pages/index.js
import { useState, useEffect } from "react";
import FilePicker from "../components/FilePicker";
import Player from "../components/Player";
import styles from "../styles/Home.module.css";
import { parseBlob } from 'music-metadata';

export default function Home() {
  const [files, setFiles] = useState([]);
  const [tracks, setTracks] = useState([]); // Містить об'єкти з { file, metadata }

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
