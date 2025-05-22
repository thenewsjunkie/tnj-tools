
-- This trigger ensures we only ever have one conversation with state 'displaying'
CREATE OR REPLACE FUNCTION ensure_single_displaying_conversation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- If the new conversation is being set to displaying
  IF NEW.conversation_state = 'displaying' THEN
    -- Set all other conversations to completed
    UPDATE audio_conversations
    SET conversation_state = 'completed',
        display_end_time = NOW()
    WHERE id != NEW.id AND conversation_state = 'displaying';
    
    -- Ensure display timestamps are set
    IF NEW.display_start_time IS NULL THEN
      NEW.display_start_time := NOW();
    END IF;
    
    IF NEW.display_end_time IS NULL THEN
      NEW.display_end_time := NOW() + interval '30 seconds';
    END IF;
    
    -- Increment display count
    NEW.display_count := COALESCE(NEW.display_count, 0) + 1;
    
    -- Mark as having been displayed
    NEW.has_been_displayed := true;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS ensure_single_displaying_conversation_trigger ON audio_conversations;

-- Create the trigger
CREATE TRIGGER ensure_single_displaying_conversation_trigger
  BEFORE UPDATE OF conversation_state ON audio_conversations
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_displaying_conversation();
