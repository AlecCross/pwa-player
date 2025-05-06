//src/components/Playlist.jsx

import styles from '../styles/Playlist.module.css';

const Playlist = ({ files, onSelect, currentIndex }) => {
  return (
    <div>
      <h3>Список треків</h3>
      <ul>
        {files.map((file, index) => (
          <li
            key={index}
            className={`${styles.listItem} ${index === currentIndex ? styles.active : ""}`}
            onClick={() => onSelect(index)} // Передаємо індекс
          >
            {file.name}
          </li>
        ))}
      </ul>
    </div>
  );
};


export default Playlist;
