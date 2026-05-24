import { useState, useCallback, useEffect } from 'react';
import { warmup } from '../api';

const BOOT_LINES = [
  '> initiating handshake...',
  '> dialing IEEE knowledge cluster',
  '> establishing secure channel',
  '> loading neural inference layer',
  '> calibrating context window',
  '> session ready',
];

function OnboardingModal({ onDismiss }) {
  const [phase, setPhase] = useState('intro');
  const [errorMsg, setErrorMsg] = useState('');
  const [bootStep, setBootStep] = useState(0);

  useEffect(() => {
    if (phase !== 'warming') return;
    setBootStep(0);
    const t = setInterval(() => {
      setBootStep((s) => Math.min(s + 1, BOOT_LINES.length - 1));
    }, 700);
    return () => clearInterval(t);
  }, [phase]);

  const handleWarmup = useCallback(async () => {
    setPhase('warming');
    setErrorMsg('');
    try {
      const result = await warmup();
      if (!result) {
        throw new Error('No response from backend');
      }
      setTimeout(() => onDismiss(), 800);
    } catch (e) {
      console.error('Warmup failed:', e);
      setPhase('error');
      setErrorMsg('Could not connect to the backend server. Please make sure the backend is running and try again.');
    }
  }, [onDismiss]);

  return (
    <div className="modal">
      <div className="modal__backdrop" aria-hidden="true">
        <div className="modal__grid"></div>
      </div>
      <div className="modal__panel">
        <span className="modal__corner modal__corner--tl" aria-hidden="true"></span>
        <span className="modal__corner modal__corner--tr" aria-hidden="true"></span>
        <span className="modal__corner modal__corner--bl" aria-hidden="true"></span>
        <span className="modal__corner modal__corner--br" aria-hidden="true"></span>

        <div className="modal__topbar" aria-hidden="true">
          <span className="modal__dot"></span>
          <span className="modal__dot"></span>
          <span className="modal__dot"></span>
          <span className="modal__path">~/vai/session/new</span>
        </div>

        {phase === 'intro' && (
          <div className="modal__inner">
            <div className="modal__tag">[BRIEFING · 001]</div>
            <h2 className="modal__title">
              Welcome to <span className="modal__title-accent">Vai ka AI</span>
            </h2>
            <p className="modal__lead">
              Your intelligent companion for all things IEEE. Built for research and branch excellence.
            </p>

            <ul className="modal__list">
              <li>
                <span className="modal__list-num">01</span>
                <div>
                  <strong>Dual channels</strong>
                  <span>Switch between <em>Deep Dive</em> research and <em>Student Branch</em> intel.</span>
                </div>
              </li>
              <li>
                <span className="modal__list-num">02</span>
                <div>
                  <strong>Verified citations</strong>
                  <span>Every technical answer is anchored to real IEEE references.</span>
                </div>
              </li>
              <li>
                <span className="modal__list-num">03</span>
                <div>
                  <strong>Ask sharply</strong>
                  <span>Specific queries surface specific answers — vague ones get vague replies.</span>
                </div>
              </li>
            </ul>

            <button className="modal__btn" onClick={handleWarmup}>
              <span>INITIATE SESSION</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {phase === 'warming' && (
          <div className="modal__inner modal__inner--boot">
            <div className="modal__tag">[BOOTING SESSION]</div>
            <h2 className="modal__title">Coming online</h2>
            <div className="boot">
              {BOOT_LINES.slice(0, bootStep + 1).map((line, i) => (
                <div key={i} className={`boot__line ${i === bootStep ? 'boot__line--active' : ''}`}>
                  <span className="boot__num">[{String(i + 1).padStart(2, '0')}]</span>
                  <span className="boot__txt">{line}</span>
                  {i === bootStep && <span className="boot__cursor"></span>}
                </div>
              ))}
            </div>
            <div className="boot__bar" aria-hidden="true">
              <span style={{ width: `${((bootStep + 1) / BOOT_LINES.length) * 100}%` }}></span>
            </div>
          </div>
        )}

        {phase === 'error' && (
          <div className="modal__inner modal__inner--err">
            <div className="modal__tag modal__tag--err">[FAULT · 502]</div>
            <div className="modal__err-icon" aria-hidden="true">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h2 className="modal__title">Connection failed</h2>
            <p className="modal__lead">{errorMsg}</p>
            <button className="modal__btn modal__btn--retry" onClick={handleWarmup}>
              <span>RETRY HANDSHAKE</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default OnboardingModal;
