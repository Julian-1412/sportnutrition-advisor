// Maximum number of messages kept per session (project requirement)
const MAX_MESSAGES = 7;

// Simple in-memory store — data is lost on server restart, which is acceptable
// for a demo. Replace with Redis or a DB for production persistence.
const sessions = {};

// Returns the full message history for a session, or an empty array if new
function getHistory(sessionId) {
  return sessions[sessionId] || [];
}

// Appends a message to the session and trims old messages to stay within the limit
function addMessage(sessionId, role, content) {
  if (!sessions[sessionId]) sessions[sessionId] = [];
  sessions[sessionId].push({ role, content });

  // Slice from the end to keep only the most recent MAX_MESSAGES messages
  if (sessions[sessionId].length > MAX_MESSAGES) {
    sessions[sessionId] = sessions[sessionId].slice(-MAX_MESSAGES);
  }
}

// Removes all messages for a session (useful for testing or a "clear chat" feature)
function clearSession(sessionId) {
  delete sessions[sessionId];
}

module.exports = { getHistory, addMessage, clearSession };
