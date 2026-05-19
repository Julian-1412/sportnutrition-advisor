import { useEffect, useRef } from 'react';

// Prefix audio paths with the server base URL (same env var as the API).
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

// Renders an HTML audio element and auto-plays whenever audioUrl changes.
// The .catch(() => {}) silences browser autoplay-policy rejections gracefully.
export default function AudioPlayer({ audioUrl }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      audioRef.current.play().catch(() => {});
    }
  }, [audioUrl]);

  if (!audioUrl) return null;

  return (
    <div className="audio-player">
      <audio ref={audioRef} controls src={`${BASE_URL}${audioUrl}`} />
    </div>
  );
}
