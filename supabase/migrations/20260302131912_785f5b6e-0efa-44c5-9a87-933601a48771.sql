DROP TABLE IF EXISTS public.news_alerts;
DELETE FROM public.system_settings WHERE key = 'news_alerts_last_tweet_id';