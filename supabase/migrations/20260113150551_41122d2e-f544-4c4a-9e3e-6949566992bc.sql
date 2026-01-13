-- Set file size limit to 10MB and allowed MIME types on chat-files bucket
UPDATE storage.buckets 
SET file_size_limit = 10485760,
    allowed_mime_types = ARRAY[
      'image/png', 'image/jpeg', 'image/gif', 'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip'
    ]
WHERE id = 'chat-files';

-- Create rate limit tracking table
CREATE TABLE public.rate_limits (
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  count INT DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, action)
);

-- Enable RLS on rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only allow users to see/modify their own rate limits (though typically handled by functions)
CREATE POLICY "Users can view their own rate limits" 
ON public.rate_limits 
FOR SELECT 
USING (auth.uid() = user_id);

-- Function to check rate limit (SECURITY DEFINER to bypass RLS for rate limit checks)
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id UUID,
  p_action TEXT,
  p_max_requests INT,
  p_window_seconds INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
  v_window_start TIMESTAMPTZ;
BEGIN
  SELECT count, window_start INTO v_count, v_window_start
  FROM rate_limits
  WHERE user_id = p_user_id AND action = p_action;
  
  IF NOT FOUND OR now() - v_window_start > (p_window_seconds || ' seconds')::INTERVAL THEN
    INSERT INTO rate_limits (user_id, action, count, window_start)
    VALUES (p_user_id, p_action, 1, now())
    ON CONFLICT (user_id, action) DO UPDATE
    SET count = 1, window_start = now();
    RETURN TRUE;
  END IF;
  
  IF v_count >= p_max_requests THEN
    RETURN FALSE;
  END IF;
  
  UPDATE rate_limits
  SET count = count + 1
  WHERE user_id = p_user_id AND action = p_action;
  
  RETURN TRUE;
END;
$$;

-- Function to enforce message rate limit
CREATE OR REPLACE FUNCTION public.enforce_message_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow max 10 messages per 60 seconds per user
  IF NOT check_rate_limit(NEW.user_id, 'send_message', 10, 60) THEN
    RAISE EXCEPTION 'Rate limit exceeded: maximum 10 messages per minute';
  END IF;
  RETURN NEW;
END;
$$;

-- Add trigger to messages table
CREATE TRIGGER message_rate_limit_trigger
  BEFORE INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.enforce_message_rate_limit();