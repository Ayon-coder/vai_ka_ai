import { useMemo, memo } from 'react';
import { marked } from 'marked';
import { sanitizeHtml } from '../utils/sanitize';

marked.setOptions({
  breaks: true,
  gfm: true,
});

function MessageBubble({ role, content, sources = [], timestamp }) {
  const timeStr = useMemo(() => {
    const d = timestamp ? new Date(timestamp) : new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }, [timestamp]);

  const renderedContent = useMemo(() => {
    if (role === 'assistant') {
      const raw = marked.parse(content || '');
      return { __html: sanitizeHtml(raw) };
    }
    return null;
  }, [role, content]);

  return (
    <div className={`msg msg--${role}`} role="article" aria-label={`${role === 'user' ? 'Your' : 'AI'} message`}>
      <div className="msg__rail" aria-hidden="true">
        <span className="msg__rail-tick"></span>
        <span className="msg__rail-line"></span>
        <span className="msg__rail-tick"></span>
      </div>

      <div className="msg__body">
        <div className="msg__meta">
          <span className="msg__author">
            {role === 'user' ? 'USER' : 'VAI'}
            <span className="msg__author-dot"></span>
          </span>
          <span className="msg__time">{timeStr}</span>
        </div>

        <div className="msg__panel">
          <span className="msg__corner msg__corner--tl" aria-hidden="true"></span>
          <span className="msg__corner msg__corner--tr" aria-hidden="true"></span>
          <span className="msg__corner msg__corner--bl" aria-hidden="true"></span>
          <span className="msg__corner msg__corner--br" aria-hidden="true"></span>

          <div className="msg__content">
            {role === 'assistant' ? (
              <div dangerouslySetInnerHTML={renderedContent} />
            ) : (
              <span>{content}</span>
            )}
          </div>

          {sources && sources.length > 0 && (
            <div className="msg__sources">
              <span className="msg__sources-label">
                <span className="msg__sources-bracket">[</span>
                VERIFIED IEEE REFERENCES
                <span className="msg__sources-bracket">]</span>
              </span>
              <ul className="msg__sources-list">
                {sources.map((src, idx) => (
                  <li key={idx} className="msg__source">
                    <a href={src.link} target="_blank" rel="noopener noreferrer" title={src.title}>
                      <span className="msg__source-idx">{String(idx + 1).padStart(2, '0')}</span>
                      <span className="msg__source-title">{src.title}</span>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
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
