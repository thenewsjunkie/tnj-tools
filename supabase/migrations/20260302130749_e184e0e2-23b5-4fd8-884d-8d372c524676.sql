
CREATE TABLE public.news_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tweet_id text NOT NULL UNIQUE,
  text text NOT NULL,
  author text NOT NULL DEFAULT '@cnnbrk',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  displayed boolean NOT NULL DEFAULT false
);

ALTER TABLE public.news_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read news_alerts"
  ON public.news_alerts FOR SELECT
  USING (true);

CREATE POLICY "Allow insert for news_alerts"
  ON public.news_alerts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update for news_alerts"
  ON public.news_alerts FOR UPDATE
  USING (true);
