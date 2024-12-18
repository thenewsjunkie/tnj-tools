import { TwitchMessage } from "./types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

export async function forwardToWebhook(message: TwitchMessage) {
  try {
    const webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/chat-webhooks`;
    console.log("Forwarding Twitch message to webhook:", message);
    
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
    console.log("Webhook response:", responseData);
  } catch (error) {
    console.error("Error forwarding message:", error);
    throw error; // Propagate error to caller for proper handling
  }
}