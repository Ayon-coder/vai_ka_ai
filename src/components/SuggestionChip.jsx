function SuggestionChip({ text, onClick, disabled = false }) {
  return (
    <button
      className={`suggestion-chip ${disabled ? 'suggestion-chip--disabled' : ''}`}
      onClick={() => !disabled && onClick(text)}
      disabled={disabled}
    >
      {text}
    </button>
  );
}

export default SuggestionChip;
