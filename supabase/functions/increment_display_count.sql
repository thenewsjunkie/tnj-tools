
CREATE OR REPLACE FUNCTION mark_as_displayed(conversation_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE audio_conversations
  SET conversation_state = 'displaying',
      display_count = 1  -- We'll repurpose display_count as a boolean (1 = displayed)
  WHERE id = conversation_id;
END;
$$;
