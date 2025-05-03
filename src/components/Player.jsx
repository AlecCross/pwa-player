//src/components/Player.jsx

import { useState, useRef, useEffect } from "react";
import styles from "../styles/Player.module.css";
import { parseBlob } from "music-metadata";

const Player = ({ files }) => {
  const [currentIndex, setCurrentIndex] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  const [tracks, setTracks] = useState([]);

  function naturalSort(a, b) {
    const re = /(^-?[0-9]+(\.[0-9]+)?$)|(^-?\.?[0-9]+$)|(^-?[0-9]+\.$)/i,
      sre = /(^[ ]*|[ ]*$)/g,
      dre = /(^([\w ]+,?[\w ]+)?([ ]*(.+[^,])+,?)*[. ]*([ ]*[^\w]+)+[ ]*$)/g,
      hre = /^0[x]0*([0-9a-f]+|[ ]*)$/i,
      ore = /^0(0*([0-7]+|[ ]*)+|[ ]*)$/i,
      i = function(s) { return (naturalSort.insensitive && ("" + s).toLowerCase()) || "" + s },
      // convert all to strings strip whitespace
      x = i(a).replace(sre, '') || '',
      y = i(b).replace(sre, '') || '',
      // chunk/tokenize
      xN = x.replace(re, '\0$1\0').replace(/\0$/, '').replace(/^\0/, '').split('\0'),
      yN = y.replace(re, '\0$1\0').replace(/\0$/, '').replace(/^\0/, '').split('\0'),
      // hex/octal detection
      xD = parseInt(x.match(hre)) || (xN.length != 1 && x.match(ore) && parseInt(x)) || 0,
      yD = parseInt(y.match(hre)) || (yN.length != 1 && y.match(ore) && parseInt(y)) || 0;
    let oFxNcL, oFyNcL; // Оголошуємо oFxNcL та oFyNcL без ініціалізації
  
    // first try and sort Hex/Oct first
    if (xD && yD && xD != yD) return (xD > yD) ? 1 : -1;
    // natural sorting through split numeric strings and default strings
    for (var cLoc = 0, numS = Math.max(xN.length, yN.length); cLoc < numS; cLoc++) {
      oFxNcL = !(xN[cLoc] || '').match(re) && parseFloat(xN[cLoc]) || xN[cLoc] || '';
      oFyNcL = !(yN[cLoc] || '').match(re) && parseFloat(yN[cLoc]) || yN[cLoc] || '';
      // handle numeric vs string comparison - number < string - (Kyle Adams)
      if (isNaN(oFxNcL) !== isNaN(oFyNcL)) { return (isNaN(oFxNcL)) ? 1 : -1; }
      // rely on string comparison if different types - i.e. '2' < '2a'
      else if (typeof oFxNcL !== typeof oFyNcL) {
        oFxNcL += '';
        oFyNcL += '';
      }
      if (oFxNcL < oFyNcL) return -1;
      if (oFxNcL > oFyNcL) return 1;
    }
    return 0;
  }

  const playNext = () => {
    if (!tracks?.length) return;
    setCurrentIndex((prev) => (prev === null ? 0 : (prev + 1) % tracks.length));
  };

  const playPrevious = () => {
    if (!tracks?.length) return;
    setCurrentIndex((prev) =>
      prev === null ? tracks.length - 1 : (prev - 1 + tracks.length) % tracks.length
    );
  };

  const setMediaSessionMetadata = (track) => {
    if ("mediaSession" in navigator && track?.metadata) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.metadata.title || track.file.name,
        artist: track.metadata.artist || "Невідомий виконавець",
        album: track.metadata.album || "",
        artwork: [{ src: track.metadata.pictureUrl || "/icon-512.webp", sizes: "512x512", type: "image/png" }],
      });

      navigator.mediaSession.setActionHandler("play", () => audioRef.current?.play());
      navigator.mediaSession.setActionHandler("pause", () => audioRef.current?.pause());
      navigator.mediaSession.setActionHandler("previoustrack", playPrevious);
      navigator.mediaSession.setActionHandler("nexttrack", playNext);
    } else if ("mediaSession" in navigator && track) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.file.name,
        artist: "Невідомий виконавець",
        album: "",
        artwork: [{ src: "/icon-512.webp", sizes: "512x512", type: "image/png" }],
      });
    }
  };

  useEffect(() => {
    if (!files?.length) return;

    const processFiles = async () => {
      const processedTracks = await Promise.all(
        files.map(async (file) => {
          let metadata = {
            title: file.name,
            artist: "Невідомий виконавець",
            album: "",
            pictureUrl: "/icon-512.webp",
          };

          try {
            const result = await parseBlob(file);
            metadata.title = result.common.title || file.name;
            metadata.artist = result.common.artist || "Невідомий виконавець";
            metadata.album = result.common.album || "";
            if (result.common.picture?.[0]) {
              const pic = result.common.picture[0];
              const blob = new Blob([pic.data], { type: pic.format });
              metadata.pictureUrl = URL.createObjectURL(blob);
            }
            metadata.trackNumber = result.common.track?.no ?? null;
          } catch (err) {
            console.warn("Не вдалося зчитати теги для", file.name, err);
          }

          return { file, metadata };
        })
      );

      console.log("Початковий масив processedTracks:", processedTracks.map(item => ({ name: item.file.name, track: item.metadata.trackNumber })));

      const sortedTracks = [...processedTracks].sort((a, b) => {
        const trackA = a.metadata.trackNumber;
        const trackB = b.metadata.trackNumber;

        console.log(`Порівняння: "${a.file.name}" (track: ${trackA}) vs "${b.file.name}" (track: ${trackB})`);

        if (trackA != null && trackB != null) {
          const numA = parseInt(trackA, 10);
          const numB = parseInt(trackB, 10);
          if (!isNaN(numA) && !isNaN(numB)) {
            const result = numA - numB;
            console.log(`  Числове порівняння trackNumber: ${numA} - ${numB} = ${result}`);
            return result;
          }
          const stringResult = String(trackA).localeCompare(String(trackB), undefined, { numeric: true, sensitivity: 'base' });
          console.log(`  Рядкове порівняння trackNumber: "${trackA}" vs "${trackB}" = ${stringResult}`);
          return stringResult;
        }

        const naturalSortResult = naturalSort(a.file.name, b.file.name);
        console.log(`  Natural sort (один або обидва без trackNumber): "${a.file.name}" vs "${b.file.name}" = ${naturalSortResult}`);
        return naturalSortResult;
      });

      console.log("Відсортований масив sortedTracks:", sortedTracks.map(item => ({ name: item.file.name, track: item.metadata.trackNumber })));
      setTracks(sortedTracks);
      setCurrentIndex(0);
    };

    processFiles();
  }, [files]);

  // Оновлення currentTrack при зміні currentIndex
  useEffect(() => {
    if (tracks?.length && currentIndex !== null) {
      setCurrentTrack(tracks[currentIndex]);
    }
  }, [currentIndex, tracks]);

  // Завантаження треку
  useEffect(() => {
    if (!currentTrack) return;
    const file = currentTrack.file;

    if (!(file instanceof File)) return console.error("Недійсний файл:", file);

    if (audioRef.current?.src) URL.revokeObjectURL(audioRef.current.src);

    const url = URL.createObjectURL(file);
    const audio = audioRef.current;
    audio.src = url;
    audio.load();
    audio.play().catch((err) => {
      console.warn("Автовідтворення не вдалося:", err);
    });

    setMediaSessionMetadata(currentTrack);
  }, [currentTrack]);

  // Ініціалізація аудіо подій (без змін)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => setDuration(audio.duration);
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if ("mediaSession" in navigator && typeof navigator.mediaSession.setPositionState === "function" && !isNaN(audio.duration) && audio.readyState >= 1) {
        try {
          navigator.mediaSession.setPositionState({ duration: audio.duration, playbackRate: audio.playbackRate, position: audio.currentTime });
        } catch (e) {
          console.warn("setPositionState error:", e);
        }
      }
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, []);

  const handleAudioEnd = () => playNext();

  return (
    <div className={styles.playerContainer}>
      <div className={styles.playerHeader}>
        <img src={currentTrack?.metadata?.pictureUrl || "/icon-512.webp"} alt="Обкладинка" className={styles.coverArt} />
        <div className={styles.metadata}>
          <strong className={styles.title}>{currentTrack?.metadata?.title || currentTrack?.file?.name || ""}</strong>
          <p className={styles.subtitle}>
            {currentTrack?.metadata?.artist || "Невідомий виконавець"}
            {currentTrack?.metadata?.album ? ` — ${currentTrack.metadata.album}` : ""}
          </p>
          <div className={styles.audioControls}>
            <button onClick={playPrevious} disabled={!tracks?.length}>⏮</button>
            <button onClick={playNext} disabled={!tracks?.length}>⏭</button>
          </div>
        </div>
      </div>

      <audio ref={audioRef} controls onEnded={handleAudioEnd} className={styles.audioElement} />

      <ul className={styles.trackList}>
        {tracks?.map((track, index) => (
          <li
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`${styles.trackItem} ${index === currentIndex ? styles.trackItemActive : ""}`}
          >
            <span className={styles.trackName}>{track.file.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Player;
