
-- Create hall_of_frame_photos table
CREATE TABLE public.hall_of_frame_photos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url text NOT NULL,
  caption text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hall_of_frame_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view hall_of_frame_photos" ON public.hall_of_frame_photos FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert hall_of_frame_photos" ON public.hall_of_frame_photos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can update hall_of_frame_photos" ON public.hall_of_frame_photos FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can delete hall_of_frame_photos" ON public.hall_of_frame_photos FOR DELETE USING (auth.role() = 'authenticated');

-- Create hall_of_frame_settings table
CREATE TABLE public.hall_of_frame_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  interval_seconds integer NOT NULL DEFAULT 8,
  transition text NOT NULL DEFAULT 'fade',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hall_of_frame_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view hall_of_frame_settings" ON public.hall_of_frame_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert hall_of_frame_settings" ON public.hall_of_frame_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can update hall_of_frame_settings" ON public.hall_of_frame_settings FOR UPDATE USING (auth.role() = 'authenticated');

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('hall_of_frame', 'hall_of_frame', true);

-- Storage policies
CREATE POLICY "Public can view hall_of_frame files" ON storage.objects FOR SELECT USING (bucket_id = 'hall_of_frame');
CREATE POLICY "Authenticated can upload hall_of_frame files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'hall_of_frame' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated can delete hall_of_frame files" ON storage.objects FOR DELETE USING (bucket_id = 'hall_of_frame' AND auth.role() = 'authenticated');

-- Trigger for updated_at
CREATE TRIGGER update_hall_of_frame_photos_updated_at BEFORE UPDATE ON public.hall_of_frame_photos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hall_of_frame_settings_updated_at BEFORE UPDATE ON public.hall_of_frame_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default settings row
INSERT INTO public.hall_of_frame_settings (interval_seconds, transition) VALUES (8, 'fade');
