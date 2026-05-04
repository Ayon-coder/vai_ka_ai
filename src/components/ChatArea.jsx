import { forwardRef } from 'react';
import MessageBubble from './MessageBubble';
import SuggestionChip from './SuggestionChip';
import LoadingIndicator from './LoadingIndicator';

const ChatArea = forwardRef(function ChatArea(
  { messages, isTyping, showWelcome, modeContent, onSuggestionClick, mode, isReady },
  ref
) {
  return (
    <main className="chat-wrapper" id="chat-wrapper" ref={ref}>
      {showWelcome && (
        <div className="welcome-container">
          <h2>Hi, I'm Vai.</h2>
          <p id="welcome-desc">{modeContent.description}</p>
          <div className="suggestions">
            {modeContent.suggestions.map((text, idx) => (
              <SuggestionChip
                key={idx}
                text={text}
                onClick={onSuggestionClick}
                disabled={!isReady}
              />
            ))}
          </div>
        </div>
      )}

      <div id="messages-list">
        {messages.map((msg, idx) => (
          <MessageBubble
            key={idx}
            role={msg.role}
            content={msg.content}
            sources={msg.sources}
            timestamp={msg.timestamp}
          />
        ))}
      </div>

      {isTyping && (
        mode === 'deep_dive' ? (
          <LoadingIndicator />
        ) : (
          <div id="typing-indicator">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        )
      )}
    </main>
  );
});

export default ChatArea;
