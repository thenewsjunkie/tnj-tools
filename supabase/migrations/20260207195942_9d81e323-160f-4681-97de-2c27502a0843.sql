
-- Create SS Tools settings table (single-row config)
CREATE TABLE public.ss_tools_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week integer NOT NULL DEFAULT 5,
  time_of_day text NOT NULL DEFAULT '19:00',
  timezone text NOT NULL DEFAULT 'America/New_York',
  stream_url text NOT NULL DEFAULT '',
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ss_tools_settings ENABLE ROW LEVEL SECURITY;

-- Public read access (countdown page needs to read settings)
CREATE POLICY "Anyone can read ss_tools_settings"
  ON public.ss_tools_settings FOR SELECT
  USING (true);

-- Only authenticated admins can update
CREATE POLICY "Admins can update ss_tools_settings"
  ON public.ss_tools_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert ss_tools_settings"
  ON public.ss_tools_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default row
INSERT INTO public.ss_tools_settings (day_of_week, time_of_day, timezone, stream_url)
VALUES (5, '19:00', 'America/New_York', '');
