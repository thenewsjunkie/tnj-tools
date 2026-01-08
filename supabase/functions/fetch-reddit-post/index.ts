import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Try to fetch from a URL with proper headers
async function tryFetch(url: string): Promise<Response> {
  return fetch(url, {
    headers: {
      "User-Agent": "TNJShowPrep/1.0 (Reddit TIL fetcher)",
      "Accept": "application/json",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
}

// Extract post ID from Reddit URL
function extractPostId(pathname: string): string | null {
  const match = pathname.match(/\/comments\/([a-z0-9]+)/i);
  return match ? match[1] : null;
}

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

    // Parse the Reddit URL
    const parsedUrl = new URL(url.trim());
    
    // Clean up pathname
    let pathname = parsedUrl.pathname;
    if (pathname.endsWith("/")) {
      pathname = pathname.slice(0, -1);
    }
    if (pathname.endsWith(".json")) {
      pathname = pathname.slice(0, -5);
    }

    const postId = extractPostId(pathname);

    // Build list of endpoints to try (in order)
    const endpoints: string[] = [
      `https://www.reddit.com${pathname}.json?raw_json=1`,
      `https://old.reddit.com${pathname}.json?raw_json=1`,
    ];
    
    // Add short-form URL if we have post ID
    if (postId) {
      endpoints.push(`https://www.reddit.com/comments/${postId}.json?raw_json=1`);
    }

    console.log("Will try endpoints:", endpoints);

    let lastError: string = "";
    let lastStatus: number = 0;

    // Try each endpoint
    for (const endpoint of endpoints) {
      console.log("Trying:", endpoint);
      
      try {
        const response = await tryFetch(endpoint);
        console.log(`Response from ${endpoint}: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          const postData = data[0]?.data?.children?.[0]?.data;

          if (postData) {
            let title = postData.title || "";
            if (title.toLowerCase().startsWith("til ")) {
              title = "TIL " + title.slice(4);
            }

            let description = postData.selftext || "";
            if (!description && postData.url && !postData.url.includes("reddit.com")) {
              description = `Source: ${postData.url}`;
            }

            // Decode HTML entities
            description = description
              .replace(/&amp;/g, "&")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'");

            console.log("Successfully fetched post:", title.substring(0, 50));

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
          }
        }
        
        lastStatus = response.status;
        lastError = `HTTP ${response.status}`;
      } catch (fetchErr: any) {
        console.error(`Fetch error for ${endpoint}:`, fetchErr.message);
        lastError = fetchErr.message;
      }
    }

    // All JSON endpoints failed - try oEmbed as fallback
    console.log("All JSON endpoints failed, trying oEmbed...");
    
    try {
      const oembedUrl = `https://www.reddit.com/oembed?url=${encodeURIComponent(url)}`;
      console.log("Trying oEmbed:", oembedUrl);
      
      const oembedResponse = await tryFetch(oembedUrl);
      
      if (oembedResponse.ok) {
        const oembedData = await oembedResponse.json();
        console.log("oEmbed response:", JSON.stringify(oembedData).substring(0, 200));
        
        if (oembedData.title) {
          let title = oembedData.title;
          if (title.toLowerCase().startsWith("til ")) {
            title = "TIL " + title.slice(4);
          }

          return new Response(
            JSON.stringify({
              title,
              description: "", // oEmbed typically doesn't include full text
              thumbnail: oembedData.thumbnail_url || null,
              author: oembedData.author_name || null,
              score: null,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } else {
        console.log("oEmbed failed with status:", oembedResponse.status);
      }
    } catch (oembedErr: any) {
      console.error("oEmbed error:", oembedErr.message);
    }

    // Everything failed
    const errorMsg = lastStatus === 403 
      ? "Reddit blocked this request (403). The post may be private or Reddit is rate-limiting."
      : lastStatus === 429
      ? "Reddit rate limit hit (429). Please wait a moment and try again."
      : `Failed to fetch Reddit post: ${lastError}`;

    console.error("All attempts failed:", errorMsg);

    return new Response(
      JSON.stringify({ error: errorMsg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch Reddit post" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
