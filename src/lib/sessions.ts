import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatSession {
  id: string;
  platform: string;
  external_user_id: string;
  messages: ChatMessage[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export async function getOrCreateSession(platform: string, externalUserId: string): Promise<ChatSession> {
  const { data: existing } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('platform', platform)
    .eq('external_user_id', externalUserId)
    .single();

  if (existing) return existing as ChatSession;

  const { data: created, error } = await supabase
    .from('chat_sessions')
    .insert({ platform, external_user_id: externalUserId })
    .select('*')
    .single();

  if (error) throw new Error(`Failed to create session: ${error.message}`);
  return created as ChatSession;
}

export async function appendToSession(sessionId: string, newMessages: ChatMessage[]): Promise<void> {
  const { error } = await supabase.rpc('append_messages_atomic', {
    p_session_id: sessionId,
    p_new_messages: JSON.stringify(newMessages),
    p_max_messages: 30,
  });

  if (error) {
    console.error('Failed to append messages:', error);
    await supabase
      .from('chat_sessions')
      .update({
        messages: newMessages,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId);
  }
}

export async function getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
  const { data } = await supabase
    .from('chat_sessions')
    .select('messages')
    .eq('id', sessionId)
    .single();

  return (data?.messages as ChatMessage[]) || [];
}

export async function isMessageProcessed(messageId: string): Promise<boolean> {
  const { data } = await supabase
    .from('processed_messages')
    .select('message_id')
    .eq('message_id', messageId)
    .single();

  return !!data;
}

export async function markMessageProcessed(messageId: string, platform: string, sessionId: string): Promise<void> {
  await supabase
    .from('processed_messages')
    .insert({ message_id: messageId, platform, session_id: sessionId })
    .single();
}

export async function logWebhook(platform: string, eventType: string, payload: unknown, responseStatus?: number, error?: string): Promise<void> {
  await supabase.from('webhook_logs').insert({
    platform,
    event_type: eventType,
    payload: payload as Record<string, unknown>,
    response_status: responseStatus,
    error,
  });
}
