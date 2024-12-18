import { TwitchMessage } from "./types.ts";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",
};

export async function forwardToWebhook(message: TwitchMessage) {
  try {
    const webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/chat-webhooks`;
    console.log("[Webhook] Forwarding Twitch message to webhook:", message);
    
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
      body: JSON.stringify({
        platform: "twitch",
        type: "chat",
        data: {
          username: message.username,
          message: message.message,
          channel: message.channel,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseData = await response.text();
    console.log("[Webhook] Response:", responseData);
  } catch (error) {
    console.error("[Webhook] Error forwarding message:", error);
    throw error;
  }
}