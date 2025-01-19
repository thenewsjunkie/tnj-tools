export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

export async function forwardToWebhook(message: { type: string; username: string; message: string; channel: string; emotes?: Record<string, string[]> }) {
  try {
    console.log("[Webhook] Processing vote from Twitch:", {
      username: message.username,
      message: message.message,
    });
    
    // We no longer need to store chat messages, this function is only used for poll votes
    return { success: true };
  } catch (error) {
    console.error("[Webhook] Error forwarding message:", error);
    throw error;
  }
}