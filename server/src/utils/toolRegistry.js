const calculateMacros = require('../tools/calculateMacros');
const searchSupplements = require('../tools/searchSupplements');

// Central registry of all available tools.
// Each entry exposes two things:
//   - definition: the OpenAI function schema (name, description, parameters)
//   - handler: the actual JavaScript function that runs when the tool is called
const tools = {
  calculateMacros,
  searchSupplements,
};

// Extract only the OpenAI-compatible definitions to pass to the chat completions API
const toolDefinitions = Object.values(tools).map((t) => t.definition);

// Looks up a tool by name and executes its handler with the parsed arguments.
// Throws if the model requests a tool that doesn't exist in the registry.
function executeTool(name, args) {
  const tool = tools[name];
  if (!tool) throw new Error(`Unknown tool: ${name}`);
  return tool.handler(args);
}

module.exports = { toolDefinitions, executeTool };
