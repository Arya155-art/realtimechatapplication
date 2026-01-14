-- Add write policies to rate_limits table to prevent bypass
-- Only allow inserts/updates through the database function (SECURITY DEFINER)
-- Direct user access should be blocked

-- Policy to prevent direct user inserts (rate limiting is handled by trigger/function)
CREATE POLICY "Rate limits are managed by system only"
ON public.rate_limits
FOR INSERT
WITH CHECK (false);

-- Policy to prevent direct user updates
CREATE POLICY "Rate limits updates are managed by system only"
ON public.rate_limits
FOR UPDATE
USING (false);

-- Policy to prevent direct user deletes
CREATE POLICY "Rate limits cannot be deleted by users"
ON public.rate_limits
FOR DELETE
USING (false);