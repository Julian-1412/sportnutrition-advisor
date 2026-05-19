import { useState } from 'react';

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M2 9h14M10 3l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  }

  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      <textarea
        className="chat-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about macros, supplements, protein, performance..."
        rows={2}
        disabled={disabled}
      />
      <button className="send-btn" type="submit" disabled={disabled || !text.trim()} title="Send">
        <SendIcon />
      </button>
    </form>
  );
}
