import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

export default function ChatWindow({ messages, isLoading, onSuggest, suggestions = [] }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="chat-window">
      {messages.length === 0 && !isLoading && (
        <div className="empty-state">
          <div className="empty-icon">🏋️</div>
          <h2>Your Sports Nutrition Coach</h2>
          <p>Ask me about macros, supplements, nutrition plans, or anything related to athletic performance.</p>
          {suggestions.length > 0 && (
            <div className="suggestions">
              {suggestions.map((s) => (
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

      <div ref={bottomRef} />
    </div>
  );
}

const AssistantAvatarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="0" y="5" width="3" height="6" rx="1" fill="#22c55e"/>
    <rect x="13" y="5" width="3" height="6" rx="1" fill="#22c55e"/>
    <rect x="3" y="6.5" width="10" height="3" rx="1.5" fill="#22c55e"/>
  </svg>
);
