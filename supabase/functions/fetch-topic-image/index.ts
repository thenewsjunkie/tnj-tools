import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

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
      const searchRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encoded}&gsrlimit=3&prop=pageimages&piprop=original|thumbnail&pithumbsize=800&format=json`,
        { headers: { 'User-Agent': 'ShowPrepBot/1.0' } }
      );

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const pages = searchData.query?.pages;
        if (pages) {
          for (const page of Object.values(pages) as any[]) {
            if (page.original?.source) {
              imageUrl = page.original.source;
              break;
            }
            if (page.thumbnail?.source) {
              imageUrl = page.thumbnail.source;
              break;
            }
          }
        }
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
