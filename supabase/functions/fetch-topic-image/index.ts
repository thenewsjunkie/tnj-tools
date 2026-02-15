import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

async function searchWikipediaImages(query: string): Promise<string | null> {
  const searchRes = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${query}&gsrlimit=3&prop=pageimages&piprop=original|thumbnail&pithumbsize=800&format=json`,
    { headers: { 'User-Agent': 'ShowPrepBot/1.0' } }
  );
  if (searchRes.ok) {
    const searchData = await searchRes.json();
    const pages = searchData.query?.pages;
    if (pages) {
      for (const page of Object.values(pages) as any[]) {
        if (page.original?.source) return page.original.source;
        if (page.thumbnail?.source) return page.thumbnail.source;
      }
    }
  }
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title } = await req.json();
    if (!title) {
      return new Response(JSON.stringify({ error: 'Title is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Try direct page summary first
    const encoded = encodeURIComponent(title);
    let imageUrl: string | null = null;

    const summaryRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`,
      { headers: { 'User-Agent': 'ShowPrepBot/1.0' } }
    );

    if (summaryRes.ok) {
      const data = await summaryRes.json();
      imageUrl = data.originalimage?.source || data.thumbnail?.source || null;
    }

    // Fallback: search Wikipedia if direct lookup failed
    if (!imageUrl) {
      imageUrl = await searchWikipediaImages(encoded);
    }

    // Progressive fallback: try simplified keywords
    if (!imageUrl) {
      const stopWords = new Set(['the','a','an','of','in','on','for','and','or','is','are','was','were','to','from','by','with','about','controversy','scandal','cheating','drama','issue','issues','problem','problems','debate','update','news','latest','new','big','best','worst']);
      const keywords = title.split(/\s+/).filter((w: string) => !stopWords.has(w.toLowerCase()));
      
      // Try all significant keywords together
      if (keywords.length > 1) {
        const keywordQuery = encodeURIComponent(keywords.join(' '));
        imageUrl = await searchWikipediaImages(keywordQuery);
      }

      // Try first 2 keywords
      if (!imageUrl && keywords.length >= 2) {
        const shortQuery = encodeURIComponent(keywords.slice(0, 2).join(' '));
        imageUrl = await searchWikipediaImages(shortQuery);
      }

      // Try first keyword alone
      if (!imageUrl && keywords.length >= 1) {
        const singleQuery = encodeURIComponent(keywords[0]);
        imageUrl = await searchWikipediaImages(singleQuery);
      }
    }

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
