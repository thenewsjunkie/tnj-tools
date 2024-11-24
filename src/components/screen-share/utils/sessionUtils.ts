import { supabase } from "@/integrations/supabase/client";
import { SessionData } from "../types";

export const validateShareSession = async (code: string): Promise<SessionData> => {
  const { data: sessions, error: queryError } = await supabase
    .from('screen_share_sessions')
    .select('*')
    .eq('share_code', code.toUpperCase())
    .eq('is_active', true);

  if (queryError) {
    throw new Error(`Failed to validate session: ${queryError.message}`);
  }

  if (!sessions || sessions.length === 0) {
    throw new Error('Session does not exist or is no longer active');
  }

  if (sessions.length > 1) {
    throw new Error('Invalid session state detected');
  }

  return sessions[0];
};

export const handleExpiredSession = async (sessionId: string) => {
  await supabase
    .from('screen_share_sessions')
    .update({ 
      is_active: false,
      host_connected: false,
      viewer_connected: false,
      host_device_id: null,
      viewer_device_id: null
    })
    .eq('id', sessionId);
};

export const reconnectToSession = async (
  sessionId: string, 
  isHost: boolean
): Promise<SessionData> => {
  const updateData = isHost ? { host_connected: true } : { viewer_connected: true };
  
  const { data, error } = await supabase
    .from('screen_share_sessions')
    .update(updateData)
    .eq('id', sessionId)
    .select()
    .single();

  if (error || !data) {
    throw new Error('Failed to reconnect to session');
  }

  return data;
};

export const claimSessionRole = async (
  sessionId: string,
  deviceId: string,
  shareCode: string
): Promise<SessionData> => {
  const { data, error } = await supabase.rpc(
    'claim_screen_share_role',
    { 
      p_session_id: sessionId,
      p_device_id: deviceId,
      p_share_code: shareCode.toUpperCase()
    }
  );

  if (error || !data) {
    throw new Error('Failed to claim role in session');
  }

  return data as SessionData;
};