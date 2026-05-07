-- Queue table: users waiting to be matched
CREATE TABLE queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE,
  gender text NOT NULL CHECK (gender IN ('male', 'female')),
  filter text CHECK (filter IN ('male', 'female')),
  joined_at timestamptz NOT NULL DEFAULT now()
);

-- Sessions table: active or ended chat pairs
CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a text NOT NULL,
  user_b text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz
);

-- Messages table: chat messages per session
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  sender_id text NOT NULL,
  text text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now()
);

-- Reports table: user-submitted reports
CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id text NOT NULL,
  reported_id text NOT NULL,
  session_id uuid REFERENCES sessions(id),
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Matchmaking function: atomic find-or-join using FOR UPDATE SKIP LOCKED
CREATE OR REPLACE FUNCTION find_or_join_queue(
  p_user_id text,
  p_gender text,
  p_filter text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_match RECORD;
  v_session_id uuid;
BEGIN
  -- Validate inputs
  IF p_gender NOT IN ('male', 'female') THEN
    RAISE EXCEPTION 'Invalid gender: %', p_gender;
  END IF;
  IF p_filter IS NOT NULL AND p_filter NOT IN ('male', 'female') THEN
    RAISE EXCEPTION 'Invalid filter: %', p_filter;
  END IF;

  -- Find the oldest compatible waiting user
  SELECT q.* INTO v_match
  FROM queue q
  WHERE q.user_id != p_user_id
    AND (p_filter IS NULL OR p_filter = q.gender)
    AND (q.filter IS NULL OR q.filter = p_gender)
  ORDER BY q.joined_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF v_match IS NOT NULL THEN
    -- Create a session for both users
    INSERT INTO sessions (user_a, user_b, status)
    VALUES (p_user_id, v_match.user_id, 'active')
    RETURNING id INTO v_session_id;

    -- Remove matched user from queue
    DELETE FROM queue WHERE user_id = v_match.user_id;

    RETURN jsonb_build_object(
      'status', 'matched',
      'session_id', v_session_id,
      'partner_id', v_match.user_id
    );
  ELSE
    -- Add or update current user in queue
    INSERT INTO queue (user_id, gender, filter, joined_at)
    VALUES (p_user_id, p_gender, p_filter, now())
    ON CONFLICT (user_id) DO UPDATE
      SET gender = EXCLUDED.gender,
          filter = EXCLUDED.filter;

    RETURN jsonb_build_object('status', 'waiting');
  END IF;
END;
$$;

-- Row Level Security
-- Enable RLS on all tables to prevent direct browser reads/writes via anon key
ALTER TABLE queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- All table access goes through API routes using the service role key (bypasses RLS).
-- The anon key (used in the browser) has no direct table access.
-- No RLS policies are needed: deny-all is the default when RLS is enabled and no policies exist.

-- pg_cron: delete stale queue rows older than 10 minutes (every 5 minutes)
SELECT cron.schedule(
  'cleanup-stale-queue',
  '*/5 * * * *',
  $$DELETE FROM queue WHERE joined_at < now() - interval '10 minutes'$$
);

-- pg_cron: delete messages from sessions ended more than 24 hours ago (nightly)
SELECT cron.schedule(
  'cleanup-old-messages',
  '0 3 * * *',
  $$
    DELETE FROM messages
    WHERE session_id IN (
      SELECT id FROM sessions
      WHERE status = 'ended'
        AND ended_at < now() - interval '24 hours'
    )
  $$
);
