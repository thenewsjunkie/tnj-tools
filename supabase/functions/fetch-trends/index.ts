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
    // Fetch Google and Yahoo trends in parallel
    const [googleTrends, yahooTrends] = await Promise.all([
      fetchGoogleTrends(),
      fetchYahooTrends(),
    ]);

    return new Response(JSON.stringify({ googleTrends, yahooTrends }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    return new Response(JSON.stringify({ googleTrends: [], yahooTrends: [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function fetchGoogleTrends(): Promise<string[]> {
  const urls = [
    'https://trends.google.com/trends/api/dailytrends?hl=en-US&tz=300&geo=US&ns=15',
    'https://trends.google.com/trending/rss?geo=US',
  ];

  let trends: string[] = [];

  try {
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
    }
  } catch (e) {
    console.error('Google daily trends failed:', e);
  }

  // RSS fallback
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

  return trends;
}

async function fetchYahooTrends(): Promise<string[]> {
  try {
    const response = await fetch('https://news.yahoo.com/rss/mostviewed', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
    });

    if (!response.ok) {
      console.error('Yahoo RSS returned:', response.status);
      return [];
    }

    const xml = await response.text();
    
    // Extract <title> from each <item> in the RSS feed
    const trends: string[] = [];
    // Match item titles - they appear after <item> tags
    const itemRegex = /<item>[\s\S]*?<title>([^<]+)<\/title>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const title = match[1].trim();
      if (title && !title.includes('Yahoo News')) {
        trends.push(title);
      }
    }

    return trends.slice(0, 10).map(shortenHeadline);
  } catch (e) {
    console.error('Yahoo trends fetch failed:', e);
    return [];
  }
}

function shortenHeadline(title: string): string {
  // Truncate at first colon, em-dash, pipe, or long dash
  const separatorMatch = title.match(/^(.*?)\s*[:\|—–\-]\s/);
  if (separatorMatch && separatorMatch[1].length >= 10) {
    return separatorMatch[1].trim();
  }
  if (title.length <= 50) return title;
  return title.substring(0, 47).trimEnd() + '...';
}
