import React from 'react';

function ModeTutorialBanner({ activeMode, onModeSelect, onDismiss }) {
  return (
    <div className="mode-tutorial" id="mode-tutorial-banner" role="region" aria-label="Mode selection tutorial">
      <div className="mode-tutorial__glow" aria-hidden="true" />
      
      <div className="mode-tutorial__inner">
        {/* Top Header */}
        <div className="mode-tutorial__header">
          <div className="mode-tutorial__badge">
            <span className="mode-tutorial__badge-pulse" aria-hidden="true" />
            <span>CHANNEL SELECTION GUIDE</span>
          </div>
          <button
            type="button"
            className="mode-tutorial__close-x"
            onClick={onDismiss}
            title="Dismiss guide"
            aria-label="Close tutorial"
          >
            &times;
          </button>
        </div>

        <div className="mode-tutorial__main">
          <h3 className="mode-tutorial__title">
            Why are there two channel buttons?
          </h3>
          <p className="mode-tutorial__subtitle">
            The IEEE Assistant features two specialized intelligence channels. Switch modes anytime using the buttons in the status bar based on what you want to ask:
          </p>

          {/* Cards for both modes */}
          <div className="mode-tutorial__grid">
            {/* Deep Dive Card */}
            <div
              className={`mode-tutorial__card ${activeMode === 'deep_dive' ? 'mode-tutorial__card--active' : ''}`}
              onClick={() => onModeSelect && onModeSelect('deep_dive')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onModeSelect && onModeSelect('deep_dive')}
              title="Click to switch to Deep Dive"
            >
              <div className="mode-tutorial__card-top">
                <span className="mode-tutorial__card-icon">🔬</span>
                <div>
                  <h4 className="mode-tutorial__card-name">Deep Dive Mode</h4>
                  <span className="mode-tutorial__card-code">DD-01 · TECHNICAL & RESEARCH</span>
                </div>
                {activeMode === 'deep_dive' && (
                  <span className="mode-tutorial__card-tag">ACTIVE</span>
                )}
              </div>
              <p className="mode-tutorial__card-desc">
                Designed for technical engineering topics, IEEE standards (e.g. 802.11, 754), formulas, algorithm analysis, and academic research papers with verified citations.
              </p>
              <div className="mode-tutorial__card-sample">
                <span>Try asking:</span> "Explain IEEE 802.11 standard"
              </div>
            </div>

            {/* Student Branch Card */}
            <div
              className={`mode-tutorial__card ${activeMode === 'student_branch' ? 'mode-tutorial__card--active' : ''}`}
              onClick={() => onModeSelect && onModeSelect('student_branch')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onModeSelect && onModeSelect('student_branch')}
              title="Click to switch to Student Branch"
            >
              <div className="mode-tutorial__card-top">
                <span className="mode-tutorial__card-icon">🏛️</span>
                <div>
                  <h4 className="mode-tutorial__card-name">Student Branch Mode</h4>
                  <span className="mode-tutorial__card-code">SB-02 · COMMUNITY & MEMBERS</span>
                </div>
                {activeMode === 'student_branch' && (
                  <span className="mode-tutorial__card-tag">ACTIVE</span>
                )}
              </div>
              <p className="mode-tutorial__card-desc">
                Designed for IEEE Student Branch AOT queries — functional teams (Tech, PR, Design, Content, Media, Core), volunteer member rosters, leadership, and branch activities.
              </p>
              <div className="mode-tutorial__card-sample">
                <span>Try asking:</span> "Who are the members of the Tech Team?"
              </div>
            </div>
          </div>
        </div>

        {/* Footer with OK Action Button */}
        <div className="mode-tutorial__footer">
          <span className="mode-tutorial__tip">
            💡 <strong>Quick Tip:</strong> Click either card or the buttons above anytime to switch channels.
          </span>
          <button
            type="button"
            id="mode-tutorial-ok-btn"
            className="mode-tutorial__ok-btn"
            onClick={onDismiss}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>OK, GOT IT!</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModeTutorialBanner;
