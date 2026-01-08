import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize Reddit URL and append .json
    let jsonUrl = url.trim();
    
    // Use old.reddit.com which is more lenient with API requests
    jsonUrl = jsonUrl.replace("www.reddit.com", "old.reddit.com");
    jsonUrl = jsonUrl.replace("reddit.com", "old.reddit.com");
    
    // Remove trailing slash
    if (jsonUrl.endsWith("/")) {
      jsonUrl = jsonUrl.slice(0, -1);
    }
    
    // Remove existing .json if present
    if (jsonUrl.endsWith(".json")) {
      jsonUrl = jsonUrl.slice(0, -5);
    }
    
    // Add .json to get the API response
    jsonUrl = jsonUrl + ".json";

    console.log("Fetching Reddit URL:", jsonUrl);

    const response = await fetch(jsonUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Reddit API returned ${response.status}`);
    }

    const data = await response.json();

    // Reddit returns an array - first element is the post, second is comments
    const postData = data[0]?.data?.children?.[0]?.data;

    if (!postData) {
      throw new Error("Could not parse Reddit post data");
    }

    // Extract title - remove "TIL " prefix if present
    let title = postData.title || "";
    if (title.toLowerCase().startsWith("til ")) {
      title = "TIL " + title.slice(4); // Normalize the TIL prefix
    }

    // Get description from selftext or use a placeholder
    let description = postData.selftext || "";
    
    // If no selftext, try to get the link/content
    if (!description && postData.url && !postData.url.includes("reddit.com")) {
      description = `Source: ${postData.url}`;
    }

    // Clean up the description - decode HTML entities
    description = description
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    return new Response(
      JSON.stringify({
        title,
        description,
        thumbnail: postData.thumbnail,
        author: postData.author,
        score: postData.score,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error fetching Reddit post:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch Reddit post" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
