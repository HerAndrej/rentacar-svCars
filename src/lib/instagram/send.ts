const IG_PAGE_ACCESS_TOKEN = process.env.IG_PAGE_ACCESS_TOKEN || '';
const GRAPH_API_URL = 'https://graph.instagram.com/v21.0/me/messages';

async function fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.ok || res.status < 500) return res;
    } catch (e) {
      if (attempt === retries - 1) throw e;
    }
    await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
  }
  throw new Error('Max retries reached');
}

export async function sendInstagramMessage(recipientId: string, text: string): Promise<void> {
  // Instagram has a 1000 char limit per message
  const chunks = splitMessage(text, 1000);

  for (const chunk of chunks) {
    const res = await fetchWithRetry(GRAPH_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${IG_PAGE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text: chunk },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Instagram send failed (${res.status}): ${err}`);
    }
  }
}

export async function sendTypingIndicator(recipientId: string): Promise<void> {
  try {
    await fetch(GRAPH_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${IG_PAGE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient: { id: recipientId },
        sender_action: 'typing_on',
      }),
    });
  } catch {
    // typing indicator is best-effort
  }
}

function splitMessage(text: string, maxLength: number): string[] {
  if (text.length <= maxLength) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      chunks.push(remaining);
      break;
    }

    let splitAt = remaining.lastIndexOf('\n', maxLength);
    if (splitAt < maxLength * 0.3) {
      splitAt = remaining.lastIndexOf(' ', maxLength);
    }
    if (splitAt < maxLength * 0.3) {
      splitAt = maxLength;
    }

    chunks.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt).trimStart();
  }

  return chunks;
}
