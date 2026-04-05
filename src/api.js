const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function sendChat(messages, mode) {
  const response = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, mode }),
  });
  return response.json();
}

export async function warmup() {
  const response = await fetch(`${API_URL}/api/warmup`, { method: 'POST' });
  if (!response.ok) {
    throw new Error(`Warmup failed with status ${response.status}`);
  }
  return response.json();
}
