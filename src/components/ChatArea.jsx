import { forwardRef } from 'react';
import MessageBubble from './MessageBubble';
import SuggestionChip from './SuggestionChip';
import LoadingIndicator from './LoadingIndicator';

const ChatArea = forwardRef(function ChatArea(
  { messages, isTyping, showWelcome, modeContent, onSuggestionClick, mode, isReady },
  ref
) {
  return (
    <main className="chat" ref={ref}>
      <div className="chat__inner">
        {showWelcome && (
          <div className="welcome">
            <div className="welcome__tag">
              <span className="welcome__tag-bracket">[</span>
              {modeContent.code} · {modeContent.label.toUpperCase()}
              <span className="welcome__tag-bracket">]</span>
            </div>
            <h2 className="welcome__title">
              <span className="welcome__title-line">Hi, I'm</span>
              <span className="welcome__title-name">
                Vai<span className="welcome__title-dot">.</span>
                <span className="welcome__cursor" aria-hidden="true"></span>
              </span>
            </h2>
            <p className="welcome__desc">{modeContent.description}</p>

            <div className="welcome__divider" aria-hidden="true">
              <span></span>
              <em>TRY ASKING</em>
              <span></span>
            </div>

            <div className="welcome__suggestions">
              {modeContent.suggestions.map((text, idx) => (
                <SuggestionChip
                  key={idx}
                  text={text}
                  index={idx}
                  onClick={onSuggestionClick}
                  disabled={!isReady}
                />
              ))}
            </div>
          </div>
        )}

        <div className="msglist">
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
            <div className="typing">
              <div className="typing__rail" aria-hidden="true">
                <span className="msg__rail-tick"></span>
                <span className="msg__rail-line"></span>
                <span className="msg__rail-tick"></span>
              </div>
              <div className="typing__body">
                <span className="typing__label">VAI is composing</span>
                <div className="typing__dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </main>
  );
});

export default ChatArea;
