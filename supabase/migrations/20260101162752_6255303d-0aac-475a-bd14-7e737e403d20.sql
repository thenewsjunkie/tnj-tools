-- Create scheduled_segments table for managing recurring show segments
CREATE TABLE public.scheduled_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  time TEXT NOT NULL,
  hour_block TEXT NOT NULL,
  days INTEGER[] NOT NULL DEFAULT ARRAY[1,2,3,4,5],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scheduled_segments ENABLE ROW LEVEL SECURITY;

-- Public read access (needed for show prep display)
CREATE POLICY "Enable read access for all users"
ON public.scheduled_segments FOR SELECT
USING (true);

-- Authenticated users can manage segments
CREATE POLICY "Enable insert for authenticated users"
ON public.scheduled_segments FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users"
ON public.scheduled_segments FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users"
ON public.scheduled_segments FOR DELETE
USING (auth.role() = 'authenticated');

-- Seed with existing hardcoded segments
INSERT INTO public.scheduled_segments (name, time, hour_block, days) VALUES
  ('Amy Kaufeldt - Fox 35', '12:00 PM', 'hour-2', ARRAY[1]),
  ('Rate My Blank', '2:00 PM', 'hour-4', ARRAY[1]),
  ('The Next Episode', '12:30 PM', 'hour-2', ARRAY[1,2,3,4,5]),
  ('Jury Duty', '1:30 PM', 'hour-3', ARRAY[1,2,3,4,5]),
  ('Final Dispatches / Stories That Didn''t Make the Cut / Today I Learned', '2:45 PM', 'hour-4', ARRAY[1,2,3,4,5]);