import { useState, useRef, useCallback, useEffect } from 'react';

function InputArea({
  onSend,
  disabled = false,
  placeholder = 'Message IEEE Assistant...',
  modeCode,
  onClearChat,
  messagesCount = 0,
}) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const textareaRef = useRef(null);
  const menuRef = useRef(null);
  const optBtnRef = useRef(null);

  // Close menu on click outside or Escape
  useEffect(() => {
    if (!menuOpen) return;
    const handleOutsideClick = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        optBtnRef.current &&
        !optBtnRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [menuOpen]);

  const handleInput = useCallback((e) => {
    setValue(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
  }, []);

  const handleSend = useCallback(() => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, onSend, disabled]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const charCount = value.length;
  const isReady = !disabled && value.trim().length > 0;

  return (
    <footer className="composer">
      <div className={`composer__box ${focused ? 'is-focused' : ''} ${disabled ? 'is-disabled' : ''}`}>
        <span className="composer__corner composer__corner--tl" aria-hidden="true"></span>
        <span className="composer__corner composer__corner--tr" aria-hidden="true"></span>
        <span className="composer__corner composer__corner--bl" aria-hidden="true"></span>
        <span className="composer__corner composer__corner--br" aria-hidden="true"></span>

        <div className="composer__prefix" aria-hidden="true">
          <span className="composer__chevron">&gt;</span>
          {modeCode && <span className="composer__chan">{modeCode}</span>}
        </div>

        <textarea
          ref={textareaRef}
          className="composer__input"
          placeholder={placeholder}
          rows="1"
          value={value}
          onChange={handleInput}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-label="Message input"
        />

        <div className="composer__meta">
          <span className="composer__count" aria-hidden="true">
            {String(charCount).padStart(4, '0')}
          </span>

          <div className="composer__opt-wrapper">
            <button
              ref={optBtnRef}
              type="button"
              id="composer-opt-toggle-btn"
              className={`composer__opt-btn ${menuOpen ? 'is-active' : ''}`}
              onClick={() => setMenuOpen((prev) => !prev)}
              title="Chat actions · Clear chat"
              aria-label="Chat actions"
              aria-expanded={menuOpen}
              aria-haspopup="true"
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="composer__opt-icon"
              >
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </button>

            {menuOpen && (
              <div
                ref={menuRef}
                className="composer__menu"
                role="menu"
                aria-label="Chat options"
              >
                <div className="composer__menu-header">
                  <span>CHAT OPTIONS · {modeCode || 'CURRENT'}</span>
                  <span className="composer__menu-badge">
                    {messagesCount} {messagesCount === 1 ? 'MSG' : 'MSGS'}
                  </span>
                </div>

                <div className="composer__menu-body">
                  <button
                    type="button"
                    id="composer-clear-chat-btn"
                    className="composer__menu-item"
                    onClick={() => {
                      if (onClearChat) onClearChat();
                      setMenuOpen(false);
                    }}
                    disabled={messagesCount === 0}
                    role="menuitem"
                  >
                    <div className="composer__menu-icon-wrap" aria-hidden="true">
                      <svg
                        viewBox="0 0 24 24"
                        width="15"
                        height="15"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </div>
                    <div className="composer__menu-text">
                      <span className="composer__menu-title">Clear {modeCode || 'Current'} Chat</span>
                      <span className="composer__menu-sub">
                        Wipe {modeCode === 'DD-01' ? 'Deep Dive' : 'Student Branch'} messages
                      </span>
                    </div>
                    <span className="composer__menu-tag">RESET</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            className="composer__send"
            disabled={!isReady}
            onClick={handleSend}
            aria-label="Send message"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M5 12L19 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M13 6L19 12L13 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="composer__send-label">SEND</span>
          </button>
        </div>
      </div>
      <div className="composer__hint" aria-hidden="true">
        <kbd>Enter</kbd> to send <span>·</span> <kbd>Shift</kbd>+<kbd>Enter</kbd> for newline
      </div>
    </footer>
  );
}

export default InputArea;
