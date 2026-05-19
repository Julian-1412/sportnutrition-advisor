import ToolBadge from './ToolBadge';
import AudioPlayer from './AudioPlayer';

const AssistantAvatarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="0" y="5" width="3" height="6" rx="1" fill="#22c55e"/>
    <rect x="13" y="5" width="3" height="6" rx="1" fill="#22c55e"/>
    <rect x="3" y="6.5" width="10" height="3" rx="1.5" fill="#22c55e"/>
  </svg>
);

const UserAvatarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="5.5" r="3" fill="#a1a1aa"/>
    <path d="M2 13.5c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
);

export default function MessageBubble({ message }) {
  const { role, content, usedTool, toolName, audioUrl } = message;
  const isAssistant = role === 'assistant';

  return (
    <div className={`bubble-wrapper ${isAssistant ? 'assistant' : 'user'}`}>
      {isAssistant && (
        <div className="avatar avatar-assistant">
          <AssistantAvatarIcon />
        </div>
      )}

      <div className={`bubble ${isAssistant ? 'bubble-assistant' : 'bubble-user'}`}>
        {isAssistant && usedTool && <ToolBadge toolName={toolName} />}
        <p className="bubble-text">{content}</p>
        {isAssistant && audioUrl && <AudioPlayer audioUrl={audioUrl} />}
      </div>

      {!isAssistant && (
        <div className="avatar avatar-user">
          <UserAvatarIcon />
        </div>
      )}
    </div>
  );
}
