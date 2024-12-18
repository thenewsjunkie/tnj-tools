import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
const YOUTUBE_CLIENT_ID = Deno.env.get("YOUTUBE_CLIENT_ID");
const YOUTUBE_CLIENT_SECRET = Deno.env.get("YOUTUBE_CLIENT_SECRET");

if (!YOUTUBE_API_KEY || !YOUTUBE_CLIENT_ID || !YOUTUBE_CLIENT_SECRET) {
  console.error("Missing required YouTube credentials");
  throw new Error("Missing required YouTube credentials");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method === "POST") {
    try {
      const { action, videoId } = await req.json();
      
      if (!videoId) {
        throw new Error("Video ID is required");
      }

      if (action === "start") {
        console.log("Starting YouTube chat listener for video:", videoId);
        // Initialize YouTube chat listener
        // This will be implemented in the next step
        return new Response(
          JSON.stringify({ status: "YouTube chat listener started" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (action === "stop") {
        console.log("Stopping YouTube chat listener");
        return new Response(
          JSON.stringify({ status: "YouTube chat listener stopped" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (error) {
      console.error("Error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
  }

  return new Response(
    JSON.stringify({ error: "Method not allowed" }),
    { 
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
});