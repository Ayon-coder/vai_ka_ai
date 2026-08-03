import { useState, useRef, useCallback } from 'react';

function InputArea({ onSend, disabled = false, placeholder = 'Message IEEE Assistant...', modeCode }) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef(null);

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
