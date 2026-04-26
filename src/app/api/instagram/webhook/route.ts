import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { processMessage } from '@/lib/ai/process-message';
import { getOrCreateSession, appendToSession, getSessionMessages, isMessageProcessed, markMessageProcessed, logWebhook } from '@/lib/sessions';
import { sendInstagramMessage, sendTypingIndicator } from '@/lib/instagram/send';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const IG_VERIFY_TOKEN = process.env.IG_VERIFY_TOKEN || '';
const META_APP_SECRET = process.env.META_APP_SECRET || '';

const FALLBACK_MESSAGE = 'Izvinite, došlo je do greške. Pokušajte ponovo za par minuta ili nas kontaktirajte na +387 63 09 09 08.';

// --- GET: Webhook verification ---

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === IG_VERIFY_TOKEN) {
    console.log('Instagram webhook verified');
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

// --- POST: Receive messages ---

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // Verify signature
  const signature = req.headers.get('x-hub-signature-256');
  if (!verifySignature(rawBody, signature)) {
    await logWebhook('instagram', 'invalid_signature', null, 401);
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = JSON.parse(rawBody);

  // Respond immediately — Meta requires < 20s response
  // Process asynchronously
  handleWebhookAsync(body).catch((e) => {
    console.error('Webhook processing error:', e);
  });

  return new NextResponse('EVENT_RECEIVED', { status: 200 });
}

// --- Signature verification ---

function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!signature || !META_APP_SECRET) return false;

  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', META_APP_SECRET)
    .update(rawBody, 'utf8')
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// --- Async message processing ---

interface IGMessagingEvent {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: {
    mid: string;
    text?: string;
    is_echo?: boolean;
  };
}

async function handleWebhookAsync(body: { entry?: { messaging?: IGMessagingEvent[] }[] }) {
  const entries = body.entry || [];

  for (const entry of entries) {
    const events = entry.messaging || [];

    for (const event of events) {
      try {
        await processEvent(event);
      } catch (e) {
        console.error('Error processing IG event:', e);
        await logWebhook('instagram', 'processing_error', event, 500, String(e));

        // Send fallback message so user isn't left hanging
        if (event.sender?.id) {
          try {
            await sendInstagramMessage(event.sender.id, FALLBACK_MESSAGE);
          } catch {
            // can't even send fallback
          }
        }
      }
    }
  }
}

async function processEvent(event: IGMessagingEvent) {
  // Skip echo messages (our own outgoing messages)
  if (event.message?.is_echo) return;

  // Skip non-text messages (reactions, images, stickers)
  if (!event.message?.text) return;

  const senderId = event.sender.id;
  const messageId = event.message.mid;
  const userText = event.message.text;

  await logWebhook('instagram', 'message_received', {
    sender: senderId,
    mid: messageId,
    text: userText,
  });

  // Idempotency check
  if (await isMessageProcessed(messageId)) {
    console.log(`Skipping duplicate message: ${messageId}`);
    return;
  }

  // Get or create session
  const session = await getOrCreateSession('instagram', senderId);

  // Mark as processed early to prevent race conditions
  await markMessageProcessed(messageId, 'instagram', session.id);

  // Send typing indicator
  await sendTypingIndicator(senderId);

  // Build message history
  const history = await getSessionMessages(session.id);
  const messagesForAI = [
    ...history,
    { role: 'user' as const, content: userText },
  ];

  // Process with AI
  const result = await processMessage({
    messages: messagesForAI,
    context: { platform: 'instagram', userId: senderId },
  });

  // Save conversation
  await appendToSession(session.id, [
    { role: 'user', content: userText },
    { role: 'assistant', content: result.message },
  ]);

  // Send response
  await sendInstagramMessage(senderId, result.message);

  await logWebhook('instagram', 'message_sent', {
    recipient: senderId,
    response_length: result.message.length,
  }, 200);
}
