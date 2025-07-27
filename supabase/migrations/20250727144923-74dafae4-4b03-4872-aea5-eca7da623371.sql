-- Clean up any alerts stuck in infinite completion loop
UPDATE alert_queue 
SET status = 'completed', completed_at = NOW() 
WHERE id IN ('ac8612fa-195a-4216-9d58-68ab7fd8f469', '4163b226-8bad-443e-9008-f47ef737a684') 
AND status = 'playing';