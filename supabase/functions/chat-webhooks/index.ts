import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    console.log("Received webhook:", body);

    // Process YouTube events
    if (body.platform === "youtube") {
      const { type, data } = body;
      
      if (type === "chat") {
        await supabase.from("chat_messages").insert({
          source: "youtube",
          username: data.author.name,
          message: data.message,
          message_type: data.superChat ? "superchat" : "chat",
          superchat_amount: data.superChat?.amount,
          superchat_expires_at: data.superChat
            ? new Date(Date.now() + 60000).toISOString()
            : null,
          metadata: data,
        });
      } else if (type === "subscription") {
        await supabase.from("chat_messages").insert({
          source: "youtube",
          username: data.username,
          message: `${data.username} just subscribed!`,
          message_type: "subscription",
          metadata: data,
        });
      }
    }

    // Process Twitch events
    if (body.platform === "twitch") {
      const { type, data } = body;

      if (type === "chat") {
        await supabase.from("chat_messages").insert({
          source: "twitch",
          username: data.username,
          message: data.message,
          message_type: "chat",
          metadata: data,
        });
      } else if (type === "subscription") {
        await supabase.from("chat_messages").insert({
          source: "twitch",
          username: data.username,
          message: `${data.username} just subscribed!`,
          message_type: "subscription",
          metadata: data,
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});