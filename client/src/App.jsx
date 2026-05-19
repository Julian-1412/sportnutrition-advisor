import { useState } from 'react';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import ResponseModeToggle from './components/ResponseModeToggle';
import { sendMessage } from './services/api';
import './styles/app.css';

const SESSION_ID = crypto.randomUUID();

const LogoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="0" y="6" width="4" height="8" rx="1.5" fill="#22c55e"/>
    <rect x="16" y="6" width="4" height="8" rx="1.5" fill="#22c55e"/>
    <rect x="4" y="8.5" width="12" height="3" rx="1.5" fill="#22c55e"/>
  </svg>
);

const SUGGESTIONS = [
  'Calculate my macros for muscle gain',
  'Tell me about creatine benefits',
  'Best supplements for endurance?',
  'How much protein do I need daily?',
];

export default function App() {
  const [messages, setMessages] = useState([]);
  const [mode, setMode] = useState('text');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSend(text) {
    setError(null);
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setIsLoading(true);

    try {
      const data = await sendMessage({ message: text, mode, sessionId: SESSION_ID });
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply,
          usedTool: data.usedTool,
          toolName: data.toolName,
          audioUrl: data.audioUrl,
        },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-icon">
            <LogoIcon />
          </div>
          <div className="brand-text">
            <span className="brand-name">
              SportsNutrition <span>Advisor</span>
            </span>
            <span className="brand-tagline">AI-Powered Nutrition Coach</span>
          </div>
        </div>
        <ResponseModeToggle mode={mode} onChange={setMode} />
      </header>

      <main className="app-main">
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          onSuggest={handleSend}
          suggestions={SUGGESTIONS}
        />
      </main>

      <footer className="app-footer">
        {error && <p className="error-banner">{error}</p>}
        <ChatInput onSend={handleSend} disabled={isLoading} />
        <p className="footer-note">
          For informational purposes only — not a substitute for professional medical advice.
        </p>
      </footer>
    </div>
  );
}
