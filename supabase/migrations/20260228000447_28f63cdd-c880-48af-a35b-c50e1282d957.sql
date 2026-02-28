
CREATE TABLE public.secret_shows_gifters (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username text NOT NULL UNIQUE,
  total_gifts integer NOT NULL DEFAULT 0,
  monthly_gifts jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_gift_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.secret_shows_gifters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view secret_shows_gifters"
  ON public.secret_shows_gifters FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert secret_shows_gifters"
  ON public.secret_shows_gifters FOR INSERT
  WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "Authenticated users can update secret_shows_gifters"
  ON public.secret_shows_gifters FOR UPDATE
  USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Authenticated users can delete secret_shows_gifters"
  ON public.secret_shows_gifters FOR DELETE
  USING (auth.role() = 'authenticated'::text);

CREATE TRIGGER update_secret_shows_gifters_updated_at
  BEFORE UPDATE ON public.secret_shows_gifters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
