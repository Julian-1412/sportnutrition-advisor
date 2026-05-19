// Icon for the text response mode button (three horizontal lines).
const TextIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
    <rect x="1" y="1.5" width="12" height="2" rx="1"/>
    <rect x="1" y="6" width="8" height="2" rx="1"/>
    <rect x="1" y="10.5" width="10" height="2" rx="1"/>
  </svg>
);

// Icon for the voice response mode button (five vertical bars of varying height).
const VoiceIcon = () => (
  <svg width="16" height="14" viewBox="0 0 16 14" fill="currentColor">
    <rect x="0" y="5" width="2" height="4" rx="1"/>
    <rect x="3.5" y="3" width="2" height="8" rx="1"/>
    <rect x="7" y="1" width="2" height="12" rx="1"/>
    <rect x="10.5" y="3" width="2" height="8" rx="1"/>
    <rect x="14" y="5" width="2" height="4" rx="1"/>
  </svg>
);

// Toggle between "text" and "voice" response modes.
// In voice mode the backend also calls OpenAI TTS and returns an audio URL.
export default function ResponseModeToggle({ mode, onChange }) {
  return (
    <div className="mode-toggle" role="group" aria-label="Response mode">
      <button
        className={`mode-btn ${mode === 'text' ? 'active' : ''}`}
        onClick={() => onChange('text')}
        aria-pressed={mode === 'text'}
      >
        <TextIcon />
        Text
      </button>
      <button
        className={`mode-btn ${mode === 'voice' ? 'active' : ''}`}
        onClick={() => onChange('voice')}
        aria-pressed={mode === 'voice'}
      >
        <VoiceIcon />
        Voice
      </button>
    </div>
  );
}
