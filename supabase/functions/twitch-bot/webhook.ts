import { TwitchMessage } from "./types.ts";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",
};

export async function forwardToWebhook(message: TwitchMessage & { type: string }) {
  try {
    const webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/chat-webhooks`;
    console.log("[Webhook] Forwarding Twitch message to webhook:", {
      type: message.type,
      username: message.username,
      channel: message.channel,
    });
    
    const payload = {
      platform: "twitch",
      type: message.type,
      data: {
        username: message.username,
        message: message.message,
        channel: message.channel,
        emotes: message.emotes || {},
      },
    };

    console.log("[Webhook] Request payload:", JSON.stringify(payload));
    
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        ...corsHeaders,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Webhook] Response error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    const responseData = await response.text();
    console.log("[Webhook] Response:", responseData);
  } catch (error) {
    console.error("[Webhook] Error forwarding message:", error);
    throw error;
  }
}