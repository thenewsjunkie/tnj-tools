import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Try the newer trending endpoint first, fall back to daily trends
    const urls = [
      'https://trends.google.com/trends/api/dailytrends?hl=en-US&tz=300&geo=US&ns=15',
      'https://trends.google.com/trending/rss?geo=US',
    ];

    let trends: string[] = [];

    // Try daily trends API
    const response = await fetch(urls[0], {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const text = await response.text();
      try {
        const data = JSON.parse(text.substring(text.indexOf('{')));
        if (data?.default?.trendingSearchesDays?.[0]?.trendingSearches) {
          trends = data.default.trendingSearchesDays[0].trendingSearches
            .slice(0, 10)
            .map((trend: any) => trend.title.query)
            .filter(Boolean);
        }
      } catch (e) {
        console.error('Failed to parse daily trends JSON:', e);
      }
    } else {
      console.error('Daily trends API returned:', response.status);
    }

    // If daily trends failed, try RSS feed
    if (trends.length === 0) {
      try {
        const rssResponse = await fetch(urls[1], {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });
        if (rssResponse.ok) {
          const rssText = await rssResponse.text();
          const titleMatches = rssText.matchAll(/<title>([^<]+)<\/title>/g);
          const titles: string[] = [];
          for (const match of titleMatches) {
            if (match[1] && match[1] !== 'Daily Search Trends' && !match[1].includes('Google Trends')) {
              titles.push(match[1]);
            }
          }
          trends = titles.slice(0, 10);
        }
      } catch (e) {
        console.error('RSS fallback failed:', e);
      }
    }

    return new Response(JSON.stringify({ googleTrends: trends }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    return new Response(JSON.stringify({ googleTrends: [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
