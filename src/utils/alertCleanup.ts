import { supabase } from "@/integrations/supabase/client";

export const cleanupStaleAlerts = async () => {
  try {
    const { error } = await supabase.rpc('cleanup_stale_alerts');
    
    if (error) {
      console.error('[alertCleanup] Error cleaning up stale alerts:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('[alertCleanup] Exception during cleanup:', error);
    return false;
  }
};