import { openDB } from 'idb';

const DB_NAME = 'MusicPlayerDB';
const PLAYLIST_STORE = 'playlist';

async function openDatabase() {
  return await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(PLAYLIST_STORE)) {
        db.createObjectStore(PLAYLIST_STORE);
      }
    },
  });
}

export async function savePlaylist(directoryName, filesWithHandles) {
  const db = await openDatabase();

  // Збереження directoryName в окремій транзакції
  let tx = db.transaction(PLAYLIST_STORE, 'readwrite');
  let store = tx.objectStore(PLAYLIST_STORE);
  console.log("Збереження directoryName:", directoryName);
  await store.put('directoryName', directoryName);
  console.log("directoryName збережено.");
  await tx.done;

  // Збереження кількості файлів в окремій транзакції
  tx = db.transaction(PLAYLIST_STORE, 'readwrite');
  store = tx.objectStore(PLAYLIST_STORE);
  const numberOfFiles = filesWithHandles.length;
  console.log("Збереження кількості файлів:", numberOfFiles);
  await store.put('playlistFilesWithHandles', numberOfFiles);
  console.log("Кількість файлів збережено.");
  await tx.done;

  // Перевірка збереження
  const newDb = await openDatabase();
  const newTx = newDb.transaction(PLAYLIST_STORE, 'readonly');
  const newStore = newTx.objectStore(PLAYLIST_STORE);
  const savedNumberOfFiles = await newStore.get('playlistFilesWithHandles');
  console.log("Перевірка збереженої кількості файлів:", savedNumberOfFiles);

  return;
}

export async function loadPlaylist() {
  const db = await openDatabase();
  const tx = db.transaction(PLAYLIST_STORE, 'readonly');
  const store = tx.objectStore(PLAYLIST_STORE);

  const lastOpenedDirectoryName = await store.get('directoryName');
  const numberOfFiles = await store.get('playlistFilesWithHandles');
  let filesWithHandles;
  if (numberOfFiles !== undefined) {
    filesWithHandles = { length: numberOfFiles, message: "Playlist data might be simplified for testing." };
  }
  console.log("Завантажена кількість файлів з IndexedDB:", numberOfFiles);

  return { lastOpenedDirectoryName, filesWithHandles };
}

export async function clearPlaylist() {
  const db = await openDatabase();
  const tx = db.transaction(PLAYLIST_STORE, 'readwrite');
  const store = tx.objectStore(PLAYLIST_STORE);
  await store.clear();
  return tx.done;
}