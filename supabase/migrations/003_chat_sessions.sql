-- Chat sessions for multi-platform AI conversations
CREATE TABLE chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL CHECK (platform IN ('web', 'instagram', 'whatsapp')),
  external_user_id text NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_chat_sessions_platform_user ON chat_sessions (platform, external_user_id);
CREATE INDEX idx_chat_sessions_updated ON chat_sessions (updated_at DESC);

-- Atomic append function to prevent race conditions
CREATE OR REPLACE FUNCTION append_messages_atomic(
  p_session_id uuid,
  p_new_messages jsonb,
  p_max_messages int DEFAULT 30
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE chat_sessions
  SET
    messages = (
      SELECT jsonb_agg(msg)
      FROM (
        SELECT msg
        FROM jsonb_array_elements(messages || p_new_messages) AS msg
        ORDER BY ctid DESC
        LIMIT p_max_messages
      ) sub
    ),
    updated_at = now()
  WHERE id = p_session_id;
END;
$$;

-- Webhook logs for debugging
CREATE TABLE webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  event_type text,
  payload jsonb,
  response_status int,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_webhook_logs_created ON webhook_logs (created_at DESC);

-- Idempotency: track processed message IDs
CREATE TABLE processed_messages (
  message_id text PRIMARY KEY,
  platform text NOT NULL,
  session_id uuid REFERENCES chat_sessions(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on chat_sessions" ON chat_sessions FOR ALL USING (true);
CREATE POLICY "Service role full access on webhook_logs" ON webhook_logs FOR ALL USING (true);
CREATE POLICY "Service role full access on processed_messages" ON processed_messages FOR ALL USING (true);
