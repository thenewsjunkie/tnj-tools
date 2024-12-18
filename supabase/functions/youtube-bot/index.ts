import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { YouTubeChat } from "./youtubeChat.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
const YOUTUBE_CLIENT_ID = Deno.env.get("YOUTUBE_CLIENT_ID");
const YOUTUBE_CLIENT_SECRET = Deno.env.get("YOUTUBE_CLIENT_SECRET");
const YOUTUBE_CHANNEL_ID = Deno.env.get("YOUTUBE_CHANNEL_ID");

if (!YOUTUBE_API_KEY || !YOUTUBE_CLIENT_ID || !YOUTUBE_CLIENT_SECRET) {
  console.error("Missing required YouTube credentials");
  throw new Error("Missing required YouTube credentials");
}

let chatInstance: YouTubeChat | null = null;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, videoId } = await req.json();
    console.log(`Received ${action} request`);

    if (action === "status") {
      const status = chatInstance ? "connected" : "disconnected";
      return new Response(
        JSON.stringify({ status }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "get-config") {
      return new Response(
        JSON.stringify({ 
          api_key: YOUTUBE_API_KEY,
          channel_id: YOUTUBE_CHANNEL_ID
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "start" && !videoId) {
      throw new Error("Video ID is required");
    }

    if (action === "start") {
      console.log("Starting YouTube chat listener for video:", videoId);
      
      if (chatInstance) {
        await chatInstance.stop();
      }

      chatInstance = new YouTubeChat({
        videoId,
        apiKey: YOUTUBE_API_KEY,
        clientId: YOUTUBE_CLIENT_ID,
        clientSecret: YOUTUBE_CLIENT_SECRET,
      });

      await chatInstance.start();
      
      return new Response(
        JSON.stringify({ status: "YouTube chat listener started" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (action === "stop") {
      console.log("Stopping YouTube chat listener");
      if (chatInstance) {
        await chatInstance.stop();
        chatInstance = null;
      }
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
});
