-- Create sound_effects table
CREATE TABLE public.sound_effects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  volume FLOAT NOT NULL DEFAULT 1.0,
  trim_start FLOAT NOT NULL DEFAULT 0,
  trim_end FLOAT,
  duration FLOAT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sound_effects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Enable read access for all users"
ON public.sound_effects FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON public.sound_effects FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users"
ON public.sound_effects FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users"
ON public.sound_effects FOR DELETE
USING (auth.role() = 'authenticated');

-- Create storage bucket for sound effects
INSERT INTO storage.buckets (id, name, public) 
VALUES ('sound_effects', 'sound_effects', true);

-- Storage policies
CREATE POLICY "Sound effects are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'sound_effects');

CREATE POLICY "Authenticated users can upload sound effects"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'sound_effects' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update sound effects"
ON storage.objects FOR UPDATE
USING (bucket_id = 'sound_effects' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete sound effects"
ON storage.objects FOR DELETE
USING (bucket_id = 'sound_effects' AND auth.role() = 'authenticated');

-- Trigger for updated_at
CREATE TRIGGER update_sound_effects_updated_at
BEFORE UPDATE ON public.sound_effects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();