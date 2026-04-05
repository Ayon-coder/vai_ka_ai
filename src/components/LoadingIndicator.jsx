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
      setMessageIndex((prev) => {
        // Cycle through messages, stay on last one
        if (prev < STATUS_MESSAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-indicator">
      <div className="spinner-container">
        <svg className="spinner" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <circle className="spinner-track" cx="20" cy="20" r="16" />
          <circle className="spinner-arc" cx="20" cy="20" r="16" />
        </svg>
      </div>
      <div className="loading-text-container">
        <span className="loading-text" key={messageIndex}>
          {STATUS_MESSAGES[messageIndex]}
        </span>
        <span className="loading-dots-inline">
          <span className="ldot">.</span>
          <span className="ldot">.</span>
          <span className="ldot">.</span>
        </span>
      </div>
    </div>
  );
}

export default LoadingIndicator;
