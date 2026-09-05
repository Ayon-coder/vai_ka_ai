const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function sendChat(messages, mode) {
  const response = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, mode }),
  });
  if (!response.ok) {
    throw new Error(`Chat request failed with status ${response.status}`);
  }
  return response.json();
}

/**
 * Stream a chat response via SSE from /api/chat/stream.
 *
 * @param {Array} messages  - Chat history messages
 * @param {string} mode     - 'deep_dive' or 'student_branch'
 * @param {Object} callbacks
 * @param {function} callbacks.onChunk  - Called with each text chunk (string)
 * @param {function} callbacks.onMeta   - Called with metadata ({sources, category, is_warning, is_rejected})
 * @param {function} callbacks.onDone   - Called when stream is complete
 * @param {function} callbacks.onError  - Called on error (Error object)
 * @returns {function} abort - Call this to cancel the stream
 */
export function streamChat(messages, mode, { onChunk, onMeta, onDone, onError }) {
  const controller = new AbortController();

  (async () => {
    try {
      const response = await fetch(`${API_URL}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, mode }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Stream request failed with status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE events (separated by double newlines)
        const events = buffer.split('\n\n');
        // Keep the last incomplete chunk in the buffer
        buffer = events.pop() || '';

        for (const eventBlock of events) {
          if (!eventBlock.trim()) continue;

          const lines = eventBlock.split('\n');
          let eventType = null;
          let dataLines = [];

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              dataLines.push(line.slice(6));
            }
          }

          if (dataLines.length === 0) continue;

          const dataStr = dataLines.join('\n');

          try {
            const data = JSON.parse(dataStr);

            if (data.type === 'chunk' && onChunk) {
              onChunk(data.content || '');
            } else if (data.type === 'meta' && onMeta) {
              onMeta({
                sources: data.sources || [],
                category: data.category || '',
                is_warning: data.is_warning || false,
                is_rejected: data.is_rejected || false,
              });
            } else if (data.type === 'done' && onDone) {
              onDone();
            } else if (data.type === 'error' && onError) {
              onError(new Error(data.message || 'Stream error'));
            }
          } catch {
            // Non-JSON data line — skip
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        const lines = buffer.split('\n');
        let dataLines = [];
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            dataLines.push(line.slice(6));
          }
        }
        if (dataLines.length > 0) {
          try {
            const data = JSON.parse(dataLines.join('\n'));
            if (data.type === 'chunk' && onChunk) onChunk(data.content || '');
            if (data.type === 'done' && onDone) onDone();
          } catch {
            // Skip
          }
        }
      }

      // If onDone wasn't called by a 'done' event, call it now
      if (onDone) onDone();
    } catch (err) {
      if (err.name === 'AbortError') return;
      if (onError) onError(err);
    }
  })();

  // Return abort function
  return () => controller.abort();
}

export async function warmup() {
  const response = await fetch(`${API_URL}/api/warmup`, { method: 'POST' });
  if (!response.ok) {
    throw new Error(`Warmup failed with status ${response.status}`);
  }
  return response.json();
}
