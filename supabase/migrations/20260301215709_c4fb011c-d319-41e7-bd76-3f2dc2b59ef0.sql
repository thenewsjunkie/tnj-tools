
-- Fix process_alert_queue_trigger: remove hardcoded service role key
CREATE OR REPLACE FUNCTION public.process_alert_queue_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  service_key text;
BEGIN
  -- Get the service role key from app settings (no hardcoded fallback)
  service_key := current_setting('app.settings.service_role_key', true);
  
  IF service_key IS NULL OR service_key = '' THEN
    RAISE WARNING 'Service role key not configured in app.settings.service_role_key';
    RETURN NEW;
  END IF;
  
  PERFORM net.http_post(
    url := 'https://gpmandlkcdompmdvethh.supabase.co/functions/v1/process-alert-queue',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_key
    ),
    body := jsonb_build_object('trigger', 'new_alert')
  );
  RETURN NEW;
END;
$$;

-- Fix cleanup_stale_alerts: remove hardcoded service role key
CREATE OR REPLACE FUNCTION public.cleanup_stale_alerts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  service_key text;
BEGIN
  -- Get the service role key from app settings (no hardcoded fallback)
  service_key := current_setting('app.settings.service_role_key', true);
  
  IF service_key IS NULL OR service_key = '' THEN
    RAISE WARNING 'Service role key not configured in app.settings.service_role_key';
  ELSE
    PERFORM net.http_post(
      url := 'https://gpmandlkcdompmdvethh.supabase.co/functions/v1/process-alert-queue',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_key
      ),
      body := jsonb_build_object('trigger', 'cleanup')
    );
  END IF;
  
  -- Keep the original lower thirds cleanup
  UPDATE lower_thirds
  SET is_active = false
  WHERE 
    is_active = true 
    AND duration_seconds IS NOT NULL 
    AND activated_at IS NOT NULL
    AND activated_at + (duration_seconds || ' seconds')::interval < now();
END;
$$;
