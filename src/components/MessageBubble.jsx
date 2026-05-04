import { useMemo, memo } from 'react';
import { marked } from 'marked';

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
});

function MessageBubble({ role, content, sources = [], timestamp }) {
  const timeStr = useMemo(() => {
    const d = timestamp ? new Date(timestamp) : new Date();
    return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  }, [timestamp]);

  const renderedContent = useMemo(() => {
    if (role === 'assistant') {
      return { __html: marked.parse(content) };
    }
    return null;
  }, [role, content]);

  return (
    <div className={`message ${role}`} role="article" aria-label={`${role === 'user' ? 'Your' : 'AI'} message`}>
      <div className="avatar" aria-hidden="true">
        {role === 'user' ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        )}
      </div>
      <div className="message-content-wrapper">
        <div className="message-info">
          <span>{role === 'user' ? 'You' : 'Vai ka AI'}</span>
          <span>{timeStr}</span>
        </div>
        <div className="message-bubble">
          <div className="message-content">
            {role === 'assistant' ? (
              <div dangerouslySetInnerHTML={renderedContent} />
            ) : (
              content
            )}
          </div>

          {sources && sources.length > 0 && (
            <div className="sources-container">
              <span className="sources-title">Verified IEEE References</span>
              <ul className="source-list">
                {sources.map((src, idx) => (
                  <li key={idx} className="source-item">
                    <a href={src.link} target="_blank" rel="noopener noreferrer" title={src.title}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px', verticalAlign: 'middle'}}>
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                      {src.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(MessageBubble);
