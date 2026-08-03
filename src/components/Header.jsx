function Header({ mode, modes, onModeChange }) {
  const modeKeys = Object.keys(modes);

  return (
    <header className="hdr">
      <div className="hdr__brand">
        <div className="hdr__logo" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M24 3L42.7846 13.5V34.5L24 45L5.21539 34.5V13.5L24 3Z"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.4"
            />
            <path
              d="M24 9L37.5933 16.75V32.25L24 40L10.4067 32.25V16.75L24 9Z"
              fill="url(#hex-grad)"
              opacity="0.15"
            />
            <path
              d="M24 9L37.5933 16.75V32.25L24 40L10.4067 32.25V16.75L24 9Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M18 21H30M18 27H26"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
            />
            <circle cx="24" cy="3" r="2" fill="currentColor" />
            <circle cx="42.7846" cy="13.5" r="2" fill="currentColor" />
            <circle cx="42.7846" cy="34.5" r="2" fill="currentColor" />
            <circle cx="24" cy="45" r="2" fill="currentColor" />
            <circle cx="5.21539" cy="34.5" r="2" fill="currentColor" />
            <circle cx="5.21539" cy="13.5" r="2" fill="currentColor" />
            <defs>
              <linearGradient id="hex-grad" x1="10" y1="9" x2="38" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00e5ff" />
                <stop offset="1" stopColor="#ffb84d" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="hdr__title">
          <h1>
            <span className="hdr__title-main">IEEE</span>
            <span className="hdr__title-sep">/</span>
            <span className="hdr__title-sub">Assistant</span>
          </h1>
          <span className="hdr__subtitle">
            <span className="hdr__pulse"></span>
            IEEE INTELLIGENCE NODE
          </span>
        </div>
      </div>

      <div className="hdr__controls">
        <div className="modepill" role="tablist" aria-label="Select mode">
          {modeKeys.map((k) => {
            const m = modes[k];
            const active = mode === k;
            return (
              <button
                key={k}
                role="tab"
                aria-selected={active}
                title={m.label}
                className={`modepill__btn ${active ? 'is-active' : ''}`}
                onClick={() => !active && onModeChange(k)}
              >
                {m.code}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}

export default Header;
