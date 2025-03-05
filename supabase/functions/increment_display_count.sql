
CREATE OR REPLACE FUNCTION increment_display_count(conversation_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE audio_conversations
  SET display_count = COALESCE(display_count, 0) + 1
  WHERE id = conversation_id;
END;
$$;
