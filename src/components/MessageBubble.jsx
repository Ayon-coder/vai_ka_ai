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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
            <path d="M12 12L2.69 7" />
            <path d="M12 12l9.31-5" />
            <path d="M12 12v10" />
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
