import { useState } from "react";
import FilePicker from "../components/FilePicker";
import Player from "../components/Player";
// import Playlist from "../components/Playlist";
import styles from "../styles/Home.module.css"

export default function Home() {
  const [files, setFiles] = useState([]);

  return (
    <div>
      <h1 className={styles.title}>PWA Музичний плеєр</h1>
      <FilePicker onFilesSelected={setFiles} />
      {/* {files.length > 0 && <Playlist files={files} onSelect={() => {}} />} */}
      {files.length > 0 && <Player files={files} />}
    </div>
  );
}
