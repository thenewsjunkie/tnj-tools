import { supabase } from "@/integrations/supabase/client";

export const validateShareSession = async (code: string) => {
  const normalizedCode = code.toUpperCase().trim();
  
  const { data, error } = await supabase
    .from("screen_share_sessions")
    .select("*")
    .eq("share_code", normalizedCode)
    .eq("is_active", true)
    .single();

  if (error) throw error;
  if (!data) throw new Error("No active session found");

  const now = new Date();
  const expiresAt = new Date(data.expires_at);
  
  if (expiresAt < now) {
    throw new Error("Session has expired");
  }

  return data;
};

export const updateSessionStatus = async (
  sessionId: string,
  isHost: boolean,
  connected: boolean
) => {
  const column = isHost ? "host_connected" : "viewer_connected";
  
  const { error } = await supabase
    .from("screen_share_sessions")
    .update({ [column]: connected })
    .eq("id", sessionId);

  if (error) throw error;
};