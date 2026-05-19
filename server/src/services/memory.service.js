const MAX_MESSAGES = 7;

// In-memory store keyed by sessionId
const sessions = {};

function getHistory(sessionId) {
  return sessions[sessionId] || [];
}

function addMessage(sessionId, role, content) {
  if (!sessions[sessionId]) sessions[sessionId] = [];
  sessions[sessionId].push({ role, content });
  // Keep only the last MAX_MESSAGES messages
  if (sessions[sessionId].length > MAX_MESSAGES) {
    sessions[sessionId] = sessions[sessionId].slice(-MAX_MESSAGES);
  }
}

function clearSession(sessionId) {
  delete sessions[sessionId];
}

module.exports = { getHistory, addMessage, clearSession };
