-- Add new columns for server-side processing
ALTER TABLE alert_queue 
ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS scheduled_completion TIMESTAMP WITH TIME ZONE;

-- Create function to process alert queue
CREATE OR REPLACE FUNCTION process_alert_queue_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the edge function for new pending alerts
  PERFORM net.http_post(
    url := 'https://gpmandlkcdompmdvethh.supabase.co/functions/v1/process-alert-queue',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key', true) || '"}'::jsonb,
    body := '{"trigger": "new_alert"}'::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically process new alerts
DROP TRIGGER IF EXISTS alert_queue_process_trigger ON alert_queue;
CREATE TRIGGER alert_queue_process_trigger
  AFTER INSERT ON alert_queue
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION process_alert_queue_trigger();

-- Update the cleanup function to call our new processor
CREATE OR REPLACE FUNCTION cleanup_stale_alerts()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Call the process-alert-queue function
  PERFORM net.http_post(
    url := 'https://gpmandlkcdompmdvethh.supabase.co/functions/v1/process-alert-queue',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key', true) || '"}'::jsonb,
    body := '{"trigger": "cleanup"}'::jsonb
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