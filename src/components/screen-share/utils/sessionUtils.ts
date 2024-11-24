import { supabase } from "@/integrations/supabase/client";
import { SessionData } from "../types";

export const validateShareSession = async (code: string): Promise<SessionData> => {
  console.log('Validating share session with code:', code);
  
  const { data: sessions, error } = await supabase
    .from('screen_share_sessions')
    .select('*')
    .eq('share_code', code.toUpperCase())
    .eq('is_active', true)
    .maybeSingle(); // Using maybeSingle() instead of single() to handle no results case

  if (error) {
    console.error('Database error during session validation:', error);
    throw new Error(`Failed to validate session: ${error.message}`);
  }

  if (!sessions) {
    console.error('No active session found for code:', code);
    throw new Error('No active session found with this code');
  }

  console.log('Found session:', sessions);
  return sessions;
};

export const handleExpiredSession = async (sessionId: string) => {
  console.log('Handling expired session:', sessionId);
  const { error } = await supabase
    .from('screen_share_sessions')
    .update({
      is_active: false,
      host_connected: false,
      viewer_connected: false,
      host_device_id: null,
      viewer_device_id: null
    })
    .eq('id', sessionId);

  if (error) {
    console.error('Error handling expired session:', error);
  }
};

export const reconnectToSession = async (
  sessionId: string,
  isHost: boolean
): Promise<SessionData> => {
  console.log('Attempting to reconnect to session:', sessionId, 'as host:', isHost);
  
  const { data, error } = await supabase
    .from('screen_share_sessions')
    .update(isHost ? { host_connected: true } : { viewer_connected: true })
    .eq('id', sessionId)
    .eq('is_active', true)
    .select()
    .maybeSingle(); // Using maybeSingle() instead of single()

  if (error || !data) {
    console.error('Failed to reconnect to session:', error);
    throw new Error('Failed to reconnect to session');
  }

  console.log('Successfully reconnected to session:', data);
  return data;
};

export const claimSessionRole = async (
  sessionId: string,
  deviceId: string,
  shareCode: string
): Promise<SessionData> => {
  console.log('Claiming role for session:', sessionId, 'device:', deviceId);
  
  const { data, error } = await supabase
    .rpc('claim_screen_share_role', {
      p_session_id: sessionId,
      p_device_id: deviceId,
      p_share_code: shareCode
    });

  if (error || !data) {
    console.error('Failed to claim role:', error);
    throw new Error('Failed to claim role in session');
  }

  console.log('Successfully claimed role:', data);
  return data;
};