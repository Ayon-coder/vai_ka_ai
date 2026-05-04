import { useState, useCallback } from 'react';
import { warmup } from '../api';

function OnboardingModal({ onDismiss }) {
  const [phase, setPhase] = useState('intro'); // 'intro' | 'warming' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const handleWarmup = useCallback(async () => {
    setPhase('warming');
    setErrorMsg('');

    try {
      console.log('Triggering backend warmup...');
      const result = await warmup();

      if (!result) {
        throw new Error('No response from backend');
      }

      console.log('Backend warmed up successfully.');
      onDismiss();
    } catch (e) {
      console.error('Warmup failed:', e);
      setPhase('error');
      setErrorMsg('Could not connect to the backend server. Please make sure the backend is running and try again.');
    }
  }, [onDismiss]);

  return (
    <div id="onboarding-overlay" className="modal-overlay">
      <div className="modal-content">

        {/* Phase 1: Intro / Guidelines */}
        {phase === 'intro' && (
          <>
            <h2>Welcome to Vai ka AI</h2>
            <p>Your intelligent companion for all things IEEE. Designed for research and branch excellence.</p>
            <ul className="modal-list">
              <li>
                <span><strong>Dual Modes:</strong> Research with <em>Deep Dive</em> or stay local with <em>Student Branch</em>.</span>
              </li>
              <li>
                <span><strong>Real-time Sources:</strong> Technical answers are backed by verified IEEE references.</span>
              </li>
              <li>
                <span><strong>Guidelines:</strong> Detailed queries help the AI find exactly what you need.</span>
              </li>
            </ul>
            <button id="onboarding-btn" className="modal-btn" onClick={handleWarmup}>
              Start Exploring
            </button>
          </>
        )}

        {/* Phase 2: Warming up */}
        {phase === 'warming' && (
          <div className="warmup-state">
            <div className="warmup-spinner-container">
              <svg className="warmup-spinner" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                <circle className="warmup-spinner-track" cx="25" cy="25" r="20" fill="none" strokeWidth="4" />
                <circle className="warmup-spinner-arc" cx="25" cy="25" r="20" fill="none" strokeWidth="4" />
              </svg>
            </div>
            <h2>Preparing your session</h2>
            <p className="warmup-text">Initializing the AI environment and connecting to IEEE knowledge bases...</p>
            <div className="warmup-progress-bar">
              <div className="warmup-progress-fill"></div>
            </div>
          </div>
        )}

        {/* Phase 3: Error */}
        {phase === 'error' && (
          <div className="warmup-error-state">
            <div className="error-icon" style={{marginBottom: '1.5rem'}}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2" />
                <path d="M12 8v4" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="16" r="1" fill="#ef4444" />
              </svg>
            </div>
            <h2 className="error-heading">Connection Failed</h2>
            <p className="error-text" style={{marginBottom: '2rem'}}>{errorMsg}</p>
            <button className="modal-btn" onClick={handleWarmup}>
              Retry Connection
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default OnboardingModal;
