CREATE OR REPLACE FUNCTION increment_poll_option_votes(option_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE poll_options
  SET votes = votes + 1
  WHERE id = option_id;
END;
$$;