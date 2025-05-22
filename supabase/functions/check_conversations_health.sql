
CREATE OR REPLACE FUNCTION auto_complete_displayed_conversations()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Complete any displayed conversations that have exceeded their display time
  UPDATE audio_conversations
  SET conversation_state = 'completed'
  WHERE conversation_state = 'displaying' 
    AND (
      -- If it has a display_end_time and that time has passed
      (display_end_time IS NOT NULL AND display_end_time < NOW())
      OR 
      -- If it's been displaying for more than 2 minutes (as a fallback)
      (display_start_time IS NOT NULL AND display_start_time < NOW() - interval '2 minutes')
      OR
      -- If it has no display_start_time (invalid state)
      (display_start_time IS NULL)
    );
END;
$$;

-- Set up a cron job to automatically run this function every minute
-- This ensures that even without client activity, stale conversations get cleaned up
SELECT cron.schedule(
  'cleanup-stale-conversations', 
  '* * * * *',  -- Run every minute
  $$SELECT auto_complete_displayed_conversations()$$
);
