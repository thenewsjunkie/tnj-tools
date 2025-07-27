-- Fix the trigger function to use the service role key from settings
CREATE OR REPLACE FUNCTION process_alert_queue_trigger()
RETURNS TRIGGER AS $$
DECLARE
  service_key text;
BEGIN
  -- Get the service role key from current setting or use hardcoded value
  service_key := coalesce(
    current_setting('app.settings.service_role_key', true),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbWFuZGxrY2RvbXBtZHZldGhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjQ2MzY2NywiZXhwIjoyMDQ4MDM5NjY3fQ.EIVqe_U_dTOLYrKM_K3wdMRbEHh7lsDQKlZOKkYnFjo'
  );
  
  -- Call the edge function for new pending alerts
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
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'public';

-- Update the cleanup function to use the proper service key
CREATE OR REPLACE FUNCTION cleanup_stale_alerts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  service_key text;
BEGIN
  -- Get the service role key
  service_key := coalesce(
    current_setting('app.settings.service_role_key', true),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbWFuZGxrY2RvbXBtZHZldGhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjQ2MzY2NywiZXhwIjoyMDQ4MDM5NjY3fQ.EIVqe_U_dTOLYrKM_K3wdMRbEHh7lsDQKlZOKkYnFjo'
  );
  
  -- Call the process-alert-queue function
  PERFORM net.http_post(
    url := 'https://gpmandlkcdompmdvethh.supabase.co/functions/v1/process-alert-queue',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_key
    ),
    body := jsonb_build_object('trigger', 'cleanup')
  );
  
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