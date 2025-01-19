import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[chat-webhooks] Received request");
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          persistSession: false,
        }
      }
    );

    const body = await req.json();
    console.log("[chat-webhooks] Request body:", body);

    if (!body.platform || !body.type || !body.data?.username || !body.data?.message) {
      console.error("[chat-webhooks] Invalid request body:", body);
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { platform, type, data } = body;

    if (type === "chat" && data.message) {
      const { error } = await supabaseClient
        .from("chat_messages")
        .insert({
          source: platform,
          username: data.username,
          message: data.message,
          message_type: type,
          metadata: {
            emotes: data.emotes || {},
            channel: data.channel
          }
        });

      if (error) {
        console.error("[chat-webhooks] Database error:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      console.log("[chat-webhooks] Message stored successfully");
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[chat-webhooks] Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});