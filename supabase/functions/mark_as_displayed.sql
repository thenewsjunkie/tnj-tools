
CREATE OR REPLACE FUNCTION mark_as_displayed(conversation_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- First, complete any other displaying conversations
  UPDATE audio_conversations
  SET conversation_state = 'completed',
      display_end_time = NOW()
  WHERE conversation_state = 'displaying'
    AND id != conversation_id;
    
  -- Now mark the requested conversation as displaying
  UPDATE audio_conversations
  SET conversation_state = 'displaying',
      display_start_time = NOW(),
      display_end_time = NOW() + interval '30 seconds',
      has_been_displayed = true,
      display_count = COALESCE(display_count, 0) + 1
  WHERE id = conversation_id;
END;
$$;
