const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export async function sendMessage({ message, mode, sessionId }) {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, mode, sessionId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Server error ${res.status}`);
  }

  return res.json();
}
