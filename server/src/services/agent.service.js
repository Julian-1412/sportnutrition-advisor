const OpenAI = require('openai');
const systemPrompt = require('../prompts/systemPrompt');
const { toolDefinitions, executeTool } = require('../utils/toolRegistry');
const { retrieve } = require('./rag.service');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

/**
 * Retrieves relevant knowledge-base chunks for the latest user message and
 * formats them as an appendix to the system prompt. Returns an empty string
 * when RAG is unavailable or nothing relevant is found.
 */
async function buildRagContext(history) {
  const latestUserMessage = [...history].reverse().find((m) => m.role === 'user')?.content;
  if (!latestUserMessage) return '';

  try {
    const chunks = await retrieve(latestUserMessage, 3);
    if (!chunks.length) return '';

    const body = chunks.map((c, i) => `[${i + 1}] ${c.text}`).join('\n\n');
    return `\n\nRELEVANT KNOWLEDGE BASE CONTEXT (retrieved from ${chunks[0].source}):\n${body}`;
  } catch (err) {
    console.warn('RAG retrieval skipped:', err.message);
    return '';
  }
}

/**
 * Runs the agent loop:
 *  1. Retrieves RAG context and prepends it to the system prompt.
 *  2. Calls the model with system prompt + conversation history.
 *  3. If the model requests tool calls, executes them and feeds results back.
 *  4. Returns the final text reply plus tool metadata.
 */
async function runAgent(history) {
  const ragContext = await buildRagContext(history);

  const messages = [
    { role: 'system', content: systemPrompt + ragContext },
    ...history,
  ];

  let usedTool = false;
  let toolName = null;

  // Agentic loop — handles sequential tool calls if needed
  while (true) {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages,
      tools: toolDefinitions.map((def) => ({ type: 'function', function: def })),
      tool_choice: 'auto',
    });

    const choice = response.choices[0];
    const assistantMessage = choice.message;

    if (choice.finish_reason === 'tool_calls' && assistantMessage.tool_calls?.length) {
      usedTool = true;
      messages.push(assistantMessage);

      for (const call of assistantMessage.tool_calls) {
        toolName = call.function.name;
        const args = JSON.parse(call.function.arguments);
        const result = executeTool(toolName, args);

        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: JSON.stringify(result),
        });
      }
      // Continue loop to get the final assistant reply
    } else {
      return {
        reply: assistantMessage.content,
        usedTool,
        toolName,
      };
    }
  }
}

module.exports = { runAgent };
