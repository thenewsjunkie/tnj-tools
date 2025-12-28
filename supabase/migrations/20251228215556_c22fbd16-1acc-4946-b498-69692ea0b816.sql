-- Create rejoins table (mirrors sound_effects structure)
CREATE TABLE public.rejoins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  volume DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  trim_start DOUBLE PRECISION NOT NULL DEFAULT 0,
  trim_end DOUBLE PRECISION,
  duration DOUBLE PRECISION,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rejoins ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (same as sound_effects)
CREATE POLICY "Enable read access for all users" 
ON public.rejoins 
FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for authenticated users" 
ON public.rejoins 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "Enable update for authenticated users" 
ON public.rejoins 
FOR UPDATE 
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Enable delete for authenticated users" 
ON public.rejoins 
FOR DELETE 
USING (auth.role() = 'authenticated'::text);

-- Create trigger for updated_at
CREATE TRIGGER update_rejoins_updated_at
BEFORE UPDATE ON public.rejoins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for rejoins
INSERT INTO storage.buckets (id, name, public) VALUES ('rejoins', 'rejoins', true);

-- Create storage policies for rejoins bucket
CREATE POLICY "Rejoins audio is publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'rejoins');

CREATE POLICY "Authenticated users can upload rejoins" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'rejoins' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update rejoins" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'rejoins' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete rejoins" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'rejoins' AND auth.role() = 'authenticated');