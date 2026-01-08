-- Create til_entries table for Today I Learned segment
CREATE TABLE public.til_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL UNIQUE,
  story1_url text,
  story1_title text,
  story1_description text,
  story2_url text,
  story2_title text,
  story2_description text,
  story3_url text,
  story3_title text,
  story3_description text,
  story4_url text,
  story4_title text,
  story4_description text,
  story5_url text,
  story5_title text,
  story5_description text,
  story6_url text,
  story6_title text,
  story6_description text,
  story7_url text,
  story7_title text,
  story7_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.til_entries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users"
ON public.til_entries FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON public.til_entries FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users"
ON public.til_entries FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users"
ON public.til_entries FOR DELETE
USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE TRIGGER update_til_entries_updated_at
BEFORE UPDATE ON public.til_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();