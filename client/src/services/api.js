// Points to the backend server; override with VITE_API_URL in production.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

// Sends a user message to the backend and returns the agent's response.
// Throws an Error with a human-readable message if the server returns a non-2xx status.
export async function sendMessage({ message, mode, sessionId }) {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, mode, sessionId }),
  });

  if (!res.ok) {
    // Try to parse the server's error payload; fall back to a generic message
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Server error ${res.status}`);
  }

  return res.json();
}
