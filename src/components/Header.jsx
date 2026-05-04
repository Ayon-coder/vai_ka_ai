function Header({ mode, onModeChange, showGuideTooltip, onGuideTooltipDismiss }) {
  return (
    <header className="header">
      <div className="logo">
        <div className="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
            <div className="tooltip-content">
              <p>
                <strong>Switch Modes</strong><br/>
                Deep Dive for research, Student Branch for local info.
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
