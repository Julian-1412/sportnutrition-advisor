// Gear icon shown inside the tool badge to signal that a tool was invoked.
const GearIcon = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor">
    <path d="M5.5 3.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM4.2 0l-.4 1.1a4 4 0 0 0-.7.4L2 1.1.9 2.3l.6 1.1a4 4 0 0 0 0 .8L.9 5.4 2 6.6l1.1-.4.7.4L4.2 8h2.6l.4-1.4.7-.4L9 6.6l1.1-1.2-.6-1.2a4 4 0 0 0 0-.8l.6-1.1L9 1.1 7.9 1.5l-.7-.4L6.8 0H4.2z"/>
  </svg>
);

// Small badge rendered at the top of an assistant bubble when the agent
// called a tool (e.g. calculateMacros or searchSupplements) to answer.
export default function ToolBadge({ toolName }) {
  return (
    <span className="tool-badge" title={`Tool used: ${toolName}`}>
      <GearIcon />
      {toolName}
    </span>
  );
}
