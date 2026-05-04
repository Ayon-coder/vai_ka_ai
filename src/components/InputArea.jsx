import { useState, useRef, useCallback } from 'react';

function InputArea({ onSend, disabled = false }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  const handleInput = useCallback((e) => {
    setValue(e.target.value);
    // Auto-resize
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

  return (
    <footer className="input-area">
      <div className="input-box">
        <textarea
          ref={textareaRef}
          id="user-input"
          placeholder={disabled ? 'Vai is thinking...' : 'Message Vai...'}
          rows="1"
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <button 
          id="send-btn" 
          disabled={disabled || !value.trim()} 
          onClick={handleSend}
          aria-label="Send message"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </footer>
  );
}

export default InputArea;
