import { memo } from 'react';

function SuggestionChip({ text, onClick, disabled = false, index = 0 }) {
  return (
    <button
      className={`sugg ${disabled ? 'sugg--disabled' : ''}`}
      onClick={() => !disabled && onClick(text)}
      disabled={disabled}
      aria-label={`Suggestion: ${text}`}
      type="button"
      style={{ '--i': index }}
    >
      <span className="sugg__corner sugg__corner--tl" aria-hidden="true"></span>
      <span className="sugg__corner sugg__corner--tr" aria-hidden="true"></span>
      <span className="sugg__corner sugg__corner--bl" aria-hidden="true"></span>
      <span className="sugg__corner sugg__corner--br" aria-hidden="true"></span>
      <span className="sugg__idx">{String(index + 1).padStart(2, '0')}</span>
      <span className="sugg__text">{text}</span>
      <span className="sugg__arrow" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </span>
    </button>
  );
}

export default memo(SuggestionChip);
