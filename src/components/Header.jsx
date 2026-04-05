function Header({ mode, onModeChange, showGuideTooltip, onGuideTooltipDismiss }) {
  return (
    <header className="header">
      <div className="logo">
        <div className="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2" stroke="white" strokeWidth="2" />
            <path d="M12 6V12L16 14" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h1>Vai ka AI</h1>
      </div>
      <div className="header-controls">
        <select
          id="mode-selector"
          className="mode-dropdown"
          value={mode}
          onChange={(e) => onModeChange(e.target.value)}
        >
          <option value="deep_dive">IEEE Deep Dive</option>
          <option value="student_branch">IEEE Student Branch</option>
        </select>
        <div className="online-indicator">
          <span className="dot"></span>
          <span>Active</span>
        </div>

        {showGuideTooltip && (
          <div id="guide-tooltip" className="guide-tooltip">
            <div className="tooltip-arrow"></div>
            <div className="tooltip-content">
              <p>
                <strong>Try switching modes!</strong> Select <em>IEEE Deep Dive</em> for research or <em>IEEE Student Branch</em> for local info.
              </p>
              <button className="guide-btn" onClick={onGuideTooltipDismiss}>
                Got it
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
