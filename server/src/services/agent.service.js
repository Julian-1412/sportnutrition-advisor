const OpenAI = require('openai');
const systemPrompt = require('../prompts/systemPrompt');
const { toolDefinitions, executeTool } = require('../utils/toolRegistry');
const { retrieve } = require('./rag.service');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

// Fetches the most relevant knowledge-base chunks for the latest user message
// and formats them as an appendix to the system prompt.
// Returns an empty string when RAG is unavailable or no relevant chunks are found.
async function buildRagContext(history) {
  // Only embed and search against the most recent user turn
  const latestUserMessage = [...history].reverse().find((m) => m.role === 'user')?.content;
  if (!latestUserMessage) return '';

  try {
    const chunks = await retrieve(latestUserMessage, 3);
    if (!chunks.length) return '';

    // Format chunks as a numbered list appended to the system prompt
    const body = chunks.map((c, i) => `[${i + 1}] ${c.text}`).join('\n\n');
    return `\n\nRELEVANT KNOWLEDGE BASE CONTEXT (retrieved from ${chunks[0].source}):\n${body}`;
  } catch (err) {
    // RAG failure is non-fatal — the agent continues without extra context
    console.warn('RAG retrieval skipped:', err.message);
    return '';
  }
}

// Main agent function: runs an agentic loop until the model produces a final reply.
// Steps:
//   1. Inject RAG context into the system prompt
//   2. Call OpenAI with the full message history and available tools
//   3. If the model requests a tool call, execute it and feed the result back
//   4. Repeat until the model returns a text response (finish_reason !== 'tool_calls')
async function runAgent(history) {
  const ragContext = await buildRagContext(history);

  // Build the message array: system instruction first, then conversation turns
  const messages = [
    { role: 'system', content: systemPrompt + ragContext },
    ...history,
  ];

  let usedTool = false;
  let toolName = null;

  // Loop until the model stops requesting tools and returns a final answer
  while (true) {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages,
      // Expose all registered tools to the model as callable functions
      tools: toolDefinitions.map((def) => ({ type: 'function', function: def })),
      // 'auto' lets the model decide whether to call a tool or reply directly
      tool_choice: 'auto',
    });

    const choice = response.choices[0];
    const assistantMessage = choice.message;

    if (choice.finish_reason === 'tool_calls' && assistantMessage.tool_calls?.length) {
      usedTool = true;

      // Add the assistant's tool-call request to the message history
      messages.push(assistantMessage);

      // Execute each requested tool and return the result to the model
      for (const call of assistantMessage.tool_calls) {
        toolName = call.function.name;
        const args = JSON.parse(call.function.arguments);
        const result = executeTool(toolName, args);

        // Tool results must be sent back with the matching tool_call_id
        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: JSON.stringify(result),
        });
      }
      // Re-enter the loop so the model can generate a reply using the tool output
    } else {
      // Model returned a final text reply — exit the loop
      return {
        reply: assistantMessage.content,
        usedTool,
        toolName,
      };
    }
  }
}

module.exports = { runAgent };
