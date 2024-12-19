import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TWITCH_CLIENT_ID = Deno.env.get("TWITCH_CLIENT_ID");
const TWITCH_CLIENT_SECRET = Deno.env.get("TWITCH_CLIENT_SECRET");
const TWITCH_CHANNEL_NAME = Deno.env.get("TWITCH_CHANNEL_NAME");
const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
const YOUTUBE_CHANNEL_ID = Deno.env.get("YOUTUBE_CHANNEL_ID");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getTwitchViewerCount(accessToken: string): Promise<number> {
  try {
    const response = await fetch(
      `https://api.twitch.tv/helix/streams?user_login=${TWITCH_CHANNEL_NAME}`,
      {
        headers: {
          "Client-ID": TWITCH_CLIENT_ID!,
          "Authorization": `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();
    return data.data[0]?.viewer_count || 0;
  } catch (error) {
    console.error("Error fetching Twitch viewers:", error);
    return 0;
  }
}

async function getYouTubeViewerCount(): Promise<number> {
  try {
    // First, get the live stream ID
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=id&channelId=${YOUTUBE_CHANNEL_ID}&eventType=live&type=video&key=${YOUTUBE_API_KEY}`
    );

    const searchData = await searchResponse.json();
    const liveVideoId = searchData.items?.[0]?.id?.videoId;

    if (!liveVideoId) {
      console.log("No live stream found");
      return 0;
    }

    // Then get the viewer count using the live stream ID
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${liveVideoId}&key=${YOUTUBE_API_KEY}`
    );

    const data = await response.json();
    return parseInt(data.items[0]?.liveStreamingDetails?.concurrentViewers || "0", 10);
  } catch (error) {
    console.error("Error fetching YouTube viewers:", error);
    return 0;
  }
}

async function getTwitchAccessToken(): Promise<string> {
  try {
    const response = await fetch(
      "https://id.twitch.tv/oauth2/token",
      {
        method: "POST",
        body: new URLSearchParams({
          client_id: TWITCH_CLIENT_ID!,
          client_secret: TWITCH_CLIENT_SECRET!,
          grant_type: "client_credentials",
        }),
      }
    );

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error getting Twitch access token:", error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const twitchToken = await getTwitchAccessToken();
    const [twitchViewers, youtubeViewers] = await Promise.all([
      getTwitchViewerCount(twitchToken),
      getYouTubeViewerCount(),
    ]);

    console.log(`[viewer-count] Twitch viewers: ${twitchViewers}, YouTube viewers: ${youtubeViewers}`);

    return new Response(
      JSON.stringify({ 
        twitch: twitchViewers, 
        youtube: youtubeViewers 
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in viewer-count function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});