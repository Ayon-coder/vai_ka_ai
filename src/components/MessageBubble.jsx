import { useMemo } from 'react';
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
    <div className={`message ${role}`}>
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
  );
}

export default MessageBubble;
