-- Create hopper_items table for storing daily hopper links
CREATE TABLE public.hopper_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  url TEXT NOT NULL,
  title TEXT,
  thumbnail_url TEXT,
  group_id UUID,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hopper_groups table for grouping links together
CREATE TABLE public.hopper_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  name TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hopper_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hopper_groups ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (like other show prep data)
CREATE POLICY "Allow public read on hopper_items" 
ON public.hopper_items 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert on hopper_items" 
ON public.hopper_items 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update on hopper_items" 
ON public.hopper_items 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete on hopper_items" 
ON public.hopper_items 
FOR DELETE 
USING (true);

CREATE POLICY "Allow public read on hopper_groups" 
ON public.hopper_groups 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert on hopper_groups" 
ON public.hopper_groups 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update on hopper_groups" 
ON public.hopper_groups 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete on hopper_groups" 
ON public.hopper_groups 
FOR DELETE 
USING (true);

-- Add indexes for performance
CREATE INDEX idx_hopper_items_date ON public.hopper_items(date);
CREATE INDEX idx_hopper_items_group ON public.hopper_items(group_id);
CREATE INDEX idx_hopper_groups_date ON public.hopper_groups(date);

-- Create trigger for updated_at
CREATE TRIGGER update_hopper_items_updated_at
BEFORE UPDATE ON public.hopper_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();