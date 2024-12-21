import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const RESTREAM_CLIENT_ID = Deno.env.get("RESTREAM_CLIENT_ID");
const RESTREAM_CLIENT_SECRET = Deno.env.get("RESTREAM_CLIENT_SECRET");

if (!RESTREAM_CLIENT_ID || !RESTREAM_CLIENT_SECRET) {
  console.error("Missing required Restream credentials");
  throw new Error("Missing required Restream credentials");
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action } = await req.json();
    console.log(`[RestreamBot] Received ${action} request`);

    if (action === "status") {
      // TODO: Implement status check
      return new Response(
        JSON.stringify({ status: "configuring" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "start") {
      console.log("[RestreamBot] Starting OAuth flow");
      
      // Generate OAuth URL
      const authUrl = `https://api.restream.io/login?response_type=code&client_id=${RESTREAM_CLIENT_ID}&redirect_uri=${encodeURIComponent(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/restream-bot/callback`
      )}`;

      return new Response(
        JSON.stringify({ 
          status: "auth_required",
          authUrl 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "callback") {
      const { code } = await req.json();
      console.log("[RestreamBot] Processing OAuth callback");

      // Exchange code for access token
      const tokenResponse = await fetch("https://api.restream.io/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: RESTREAM_CLIENT_ID,
          client_secret: RESTREAM_CLIENT_SECRET,
          code,
          grant_type: "authorization_code",
          redirect_uri: `${Deno.env.get("SUPABASE_URL")}/functions/v1/restream-bot/callback`,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Failed to get access token: ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json();
      console.log("[RestreamBot] Successfully obtained access token");

      // Store the token in Supabase
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      const { error: settingsError } = await supabase
        .from("system_settings")
        .upsert({
          key: "restream_auth",
          value: tokenData,
          updated_at: new Date().toISOString(),
        });

      if (settingsError) {
        throw settingsError;
      }

      return new Response(
        JSON.stringify({ status: "connected" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    console.error("[RestreamBot] Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "An unexpected error occurred",
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});