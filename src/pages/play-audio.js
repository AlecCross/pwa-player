import { useEffect, useState } from 'react';

export default function PlayAudioPage() {
  const [audioUrl, setAudioUrl] = useState(null);
  const [isApiSupported, setIsApiSupported] = useState(false);

  useEffect(() => {
    if ('launchQueue' in window && 'files' in window.launchQueue) {
      console.log("✅ File Handling API підтримується");
      setIsApiSupported(true);

      window.launchQueue.setConsumer(async (launchParams) => {
        if (!launchParams.files.length) return;

        const fileHandle = launchParams.files[0];
        try {
          const file = await fileHandle.getFile();
          console.log("📂 Відкритий файл:", file.name, file.type);
          const url = URL.createObjectURL(file);
          setAudioUrl(url);
        } catch (error) {
          console.error("❌ Помилка при отриманні файлу:", error);
        }
      });
    } else {
      console.log("❌ File Handling API не підтримується");
      setIsApiSupported(false);
    }

    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]); // Додаємо `audioUrl` у залежності

  return (
    <div>
      <h1>Відтворення аудіо</h1>
      {audioUrl ? (
        <audio controls src={audioUrl}>
          Ваш браузер не підтримує аудіоелемент.
        </audio>
      ) : (
        <p>Очікування на відкриття аудіофайлу...</p>
      )}
      <p>{`Підтримка File Handling API: ${isApiSupported}`}</p>
    </div>
  );
}
