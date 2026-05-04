import { memo } from 'react';

function SuggestionChip({ text, onClick, disabled = false }) {
  return (
    <button
      className={`suggestion-chip ${disabled ? 'suggestion-chip--disabled' : ''}`}
      onClick={() => !disabled && onClick(text)}
      disabled={disabled}
      aria-label={`Suggestion: ${text}`}
      type="button"
    >
      {text}
    </button>
  );
}

export default memo(SuggestionChip);
