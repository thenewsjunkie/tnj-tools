import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Generate a description using AI
async function generateDescription(title: string): Promise<string> {
  if (!openAIApiKey) {
    console.log("No OpenAI API key, skipping AI description");
    return "";
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: 'system', 
            content: 'You are a helpful assistant that writes brief, informative descriptions for "Today I Learned" facts. Write 1-2 sentences that expand on the TIL title with interesting context or additional details. Be factual and engaging. Do not start with "TIL" or repeat the title.' 
          },
          { role: 'user', content: `Write a brief description for this TIL: ${title}` }
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    if (data.choices?.[0]?.message?.content) {
      return data.choices[0].message.content.trim();
    }
  } catch (err) {
    console.error("AI description generation failed:", err);
  }
  
  return "";
}

// Fetch with proper headers
async function tryFetch(url: string): Promise<Response> {
  return fetch(url, {
    headers: {
      "User-Agent": "TNJShowPrep/1.0 (Reddit TIL fetcher)",
      "Accept": "application/json",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
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

    // Use oEmbed to get the title (most reliable method)
    const oembedUrl = `https://www.reddit.com/oembed?url=${encodeURIComponent(url.trim())}`;
    console.log("Fetching title via oEmbed:", oembedUrl);
    
    const oembedResponse = await tryFetch(oembedUrl);
    
    if (!oembedResponse.ok) {
      throw new Error(`Failed to fetch from Reddit (status: ${oembedResponse.status})`);
    }
    
    const oembedData = await oembedResponse.json();
    
    if (!oembedData.title) {
      throw new Error("Could not extract title from Reddit post");
    }
    
    let title = oembedData.title;
    // Normalize TIL prefix
    if (title.toLowerCase().startsWith("til ")) {
      title = "TIL " + title.slice(4);
    }
    
    console.log("Got title:", title.substring(0, 50));
    
    // Always generate description with AI
    console.log("Generating AI description...");
    const description = await generateDescription(title);
    console.log("AI description:", description ? description.substring(0, 50) : "(empty)");

    return new Response(
      JSON.stringify({
        title,
        description,
        author: oembedData.author_name || null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch Reddit post" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
