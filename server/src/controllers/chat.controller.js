const { getHistory, addMessage } = require('../services/memory.service');
const { runAgent } = require('../services/agent.service');
const { synthesize } = require('../services/tts.service');

// Handles POST /api/chat — orchestrates memory, agent, and optional TTS
async function handleChat(req, res) {
  const { message, mode = 'text', sessionId } = req.body;

  // Validate required fields before doing any expensive work
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'message is required' });
  }
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'sessionId is required' });
  }

  // Add the user message to memory before calling the agent so it is
  // included in the history window passed to the LLM
  addMessage(sessionId, 'user', message.trim());
  const history = getHistory(sessionId);

  // Run the agent: retrieves RAG context, calls OpenAI, executes any tools
  const { reply, usedTool, toolName } = await runAgent(history);

  // Persist the assistant reply so future turns can reference it
  addMessage(sessionId, 'assistant', reply);

  // Only call the TTS API when the user has selected voice mode
  let audioUrl = null;
  if (mode === 'voice') {
    audioUrl = await synthesize(reply);
  }

  // Return everything the frontend needs to render the message
  return res.json({ reply, usedTool, toolName, mode, audioUrl });
}

module.exports = { handleChat };
