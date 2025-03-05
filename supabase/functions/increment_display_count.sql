
CREATE OR REPLACE FUNCTION mark_as_displayed(conversation_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE audio_conversations
  SET conversation_state = 'displaying'
  WHERE id = conversation_id;
END;
$$;
