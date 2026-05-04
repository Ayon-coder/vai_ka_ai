import { useState, useEffect } from 'react';

const STATUS_MESSAGES = [
  'We got your request',
  'Model working on it',
  'Searching IEEE sources',
  'Fetching your response',
  'Response will be ready in seconds',
];

function LoadingIndicator() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev < STATUS_MESSAGES.length - 1 ? prev + 1 : prev));
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-indicator">
      <div className="spinner-container">
        <svg className="spinner" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <circle className="spinner-track" cx="20" cy="20" r="16" fill="none" strokeWidth="3" />
          <circle className="spinner-arc" cx="20" cy="20" r="16" fill="none" strokeWidth="3" />
        </svg>
      </div>
      <div className="loading-text-container">
        <span className="loading-text" key={messageIndex}>
          {STATUS_MESSAGES[messageIndex]}
        </span>
        <div className="loading-dots-inline">
          <span className="ldot">.</span>
          <span className="ldot">.</span>
          <span className="ldot">.</span>
        </div>
      </div>
    </div>
  );
}

export default LoadingIndicator;
