import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

// Green dumbbell avatar used beside the typing indicator while a reply loads.
const AssistantAvatarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="0" y="5" width="3" height="6" rx="1" fill="#22c55e"/>
    <rect x="13" y="5" width="3" height="6" rx="1" fill="#22c55e"/>
    <rect x="3" y="6.5" width="10" height="3" rx="1.5" fill="#22c55e"/>
  </svg>
);

// Scrollable message list. Shows an empty state with suggestion chips when
// there are no messages yet, then renders each bubble in order.
// Auto-scrolls to the bottom whenever messages or loading state change.
export default function ChatWindow({ messages, isLoading, onSuggest, suggestions = [] }) {
  const bottomRef = useRef(null);

  // Keep the latest message in view as new ones arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="chat-window">
      {/* Empty state — visible only before the first message is sent */}
      {messages.length === 0 && !isLoading && (
        <div className="empty-state">
          <div className="empty-icon">🏋️</div>
          <h2>Your Sports Nutrition Coach</h2>
          <p>Ask me about macros, supplements, nutrition plans, or anything related to athletic performance.</p>
          {suggestions.length > 0 && (
            <div className="suggestions">
              {suggestions.map((s) => (
                // Clicking a chip fires the same handler as typing and sending
                <button key={s} className="suggestion-chip" onClick={() => onSuggest(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {messages.map((msg, i) => (
        <MessageBubble key={i} message={msg} />
      ))}

      {/* Animated three-dot indicator shown while the agent is thinking */}
      {isLoading && (
        <div className="bubble-wrapper assistant">
          <div className="avatar avatar-assistant">
            <AssistantAvatarIcon />
          </div>
          <div className="bubble bubble-assistant typing-indicator">
            <span /><span /><span />
          </div>
        </div>
      )}

      {/* Invisible anchor element used as the scroll target */}
      <div ref={bottomRef} />
    </div>
  );
}
