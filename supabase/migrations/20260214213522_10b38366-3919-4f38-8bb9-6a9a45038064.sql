
-- Create timer_settings table (single-row config)
CREATE TABLE public.timer_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_datetime timestamptz DEFAULT NULL,
  stream_url text NOT NULL DEFAULT '',
  button_label text NOT NULL DEFAULT 'Watch Now',
  logo_url text DEFAULT NULL,
  theme text NOT NULL DEFAULT 'dark',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.timer_settings ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Anyone can read timer_settings"
  ON public.timer_settings FOR SELECT
  USING (true);

-- Authenticated insert
CREATE POLICY "Authenticated users can insert timer_settings"
  ON public.timer_settings FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Authenticated update
CREATE POLICY "Authenticated users can update timer_settings"
  ON public.timer_settings FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Trigger for updated_at
CREATE TRIGGER update_timer_settings_updated_at
  BEFORE UPDATE ON public.timer_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.timer_settings;

-- Create timer_logos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('timer_logos', 'timer_logos', true);

-- Storage policies for timer_logos
CREATE POLICY "Anyone can view timer logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'timer_logos');

CREATE POLICY "Authenticated users can upload timer logos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'timer_logos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update timer logos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'timer_logos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete timer logos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'timer_logos' AND auth.role() = 'authenticated');
