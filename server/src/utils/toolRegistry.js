const calculateMacros = require('../tools/calculateMacros');
const searchSupplements = require('../tools/searchSupplements');

// Maps tool name -> { definition, handler }
const tools = {
  calculateMacros,
  searchSupplements,
};

const toolDefinitions = Object.values(tools).map((t) => t.definition);

function executeTool(name, args) {
  const tool = tools[name];
  if (!tool) throw new Error(`Unknown tool: ${name}`);
  return tool.handler(args);
}

module.exports = { toolDefinitions, executeTool };
