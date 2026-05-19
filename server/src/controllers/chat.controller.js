const { getHistory, addMessage } = require('../services/memory.service');
const { runAgent } = require('../services/agent.service');
const { synthesize } = require('../services/tts.service');

async function handleChat(req, res) {
  const { message, mode = 'text', sessionId } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'message is required' });
  }
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'sessionId is required' });
  }

  // Load memory and add the incoming user message
  addMessage(sessionId, 'user', message.trim());
  const history = getHistory(sessionId);

  const { reply, usedTool, toolName } = await runAgent(history);

  // Persist assistant reply to memory
  addMessage(sessionId, 'assistant', reply);

  let audioUrl = null;
  if (mode === 'voice') {
    audioUrl = await synthesize(reply);
  }

  return res.json({ reply, usedTool, toolName, mode, audioUrl });
}

module.exports = { handleChat };
