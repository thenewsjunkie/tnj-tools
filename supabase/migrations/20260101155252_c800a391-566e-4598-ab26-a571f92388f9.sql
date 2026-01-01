-- Create show_prep_notes table for storing daily show prep notes
CREATE TABLE public.show_prep_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.show_prep_notes ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users
CREATE POLICY "Enable all operations for authenticated users"
ON public.show_prep_notes
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Allow read access for all users
CREATE POLICY "Enable read access for all users"
ON public.show_prep_notes
FOR SELECT
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_show_prep_notes_updated_at
BEFORE UPDATE ON public.show_prep_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();