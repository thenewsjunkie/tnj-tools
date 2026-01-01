-- Add topic columns to show_prep_notes table
ALTER TABLE public.show_prep_notes
ADD COLUMN IF NOT EXISTS from_topic text,
ADD COLUMN IF NOT EXISTS to_topic text,
ADD COLUMN IF NOT EXISTS and_topic text,
ADD COLUMN IF NOT EXISTS last_minute_from text;