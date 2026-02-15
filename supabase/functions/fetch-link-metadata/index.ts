import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function isTwitterUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.toLowerCase();
    return (host === 'twitter.com' || host === 'www.twitter.com' || 
            host === 'x.com' || host === 'www.x.com') &&
           parsedUrl.pathname.includes('/status/');
  } catch {
    return false;
  }
}

function isYouTubeUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.toLowerCase();
    return (
      host === 'youtube.com' || host === 'www.youtube.com' ||
      host === 'youtu.be' || host === 'm.youtube.com'
    );
  } catch {
    return false;
  }
}

async function fetchTweetMetadata(url: string): Promise<{ title: string | null; ogImage: string | null }> {
  // 1. Extract tweet ID and try FxTwitter API for media/thumbnail
  const tweetIdMatch = url.match(/status\/(\d+)/);
  const tweetId = tweetIdMatch?.[1];
  let ogImage: string | null = null;

  if (tweetId) {
    try {
      console.log(`Fetching FxTwitter for tweet ID: ${tweetId}`);
      const fxResponse = await fetch(`https://api.fxtwitter.com/status/${tweetId}`);
      console.log(`FxTwitter status: ${fxResponse.status}`);
      if (fxResponse.ok) {
        const fxData = await fxResponse.json();
        console.log(`FxTwitter media:`, JSON.stringify(fxData?.tweet?.media));
        const media = fxData?.tweet?.media?.all;
        if (media?.length > 0) {
          ogImage = media[0].thumbnail_url || media[0].url || null;
        }
      }
    } catch (e) {
      console.log("FxTwitter API failed:", e?.message);
    }
  }

  // 2. Still use oEmbed for the title (tweet text + author)
  const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=1`;
  console.log(`Fetching tweet via oEmbed: ${oembedUrl}`);
  
  const response = await fetch(oembedUrl);
  let title: string | null = null;

  if (response.ok) {
    const data = await response.json();
    let tweetText = null;
    if (data.html) {
      const match = data.html.match(/<p[^>]*>([\s\S]*?)<\/p>/);
      if (match) {
        tweetText = match[1]
          .replace(/<[^>]*>/g, '')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&mdash;/g, '—')
          .replace(/&nbsp;/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
    }
    const author = data.author_name || 'Tweet';
    title = tweetText 
      ? `${author}: "${tweetText.substring(0, 120)}${tweetText.length > 120 ? '...' : ''}"`
      : author;
  }

  console.log(`Extracted tweet title: ${title}, ogImage: ${ogImage}`);
  return { title, ogImage };
}

async function fetchYouTubeMetadata(url: string): Promise<{ title: string | null; ogImage: string | null }> {
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  
  console.log(`Fetching YouTube video via oEmbed: ${oembedUrl}`);
  
  const response = await fetch(oembedUrl);
  if (!response.ok) {
    console.log(`YouTube oEmbed failed with status: ${response.status}`);
    return { title: null, ogImage: null };
  }
  
  const data = await response.json();
  console.log(`YouTube oEmbed response:`, JSON.stringify(data));
  
  // Format: "ChannelName: Video Title"
  const author = data.author_name || 'YouTube';
  const videoTitle = data.title || '';
  const title = videoTitle 
    ? `${author}: ${videoTitle}`
    : author;
  
  // YouTube oEmbed provides thumbnail_url
  const ogImage = data.thumbnail_url || null;
  
  console.log(`Extracted YouTube title: ${title}, thumbnail: ${ogImage}`);
  
  return { title, ogImage };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching metadata for: ${url}`);

    // Check if this is a Twitter/X URL
    if (isTwitterUrl(url)) {
      console.log('Detected Twitter URL, using oEmbed API');
      const tweetData = await fetchTweetMetadata(url);
      return new Response(
        JSON.stringify({ success: true, ...tweetData, url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if this is a YouTube URL
    if (isYouTubeUrl(url)) {
      console.log('Detected YouTube URL, using oEmbed API');
      const youtubeData = await fetchYouTubeMetadata(url);
      return new Response(
        JSON.stringify({ success: true, ...youtubeData, url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the page with a timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkPreview/1.0)',
        'Accept': 'text/html',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.log(`Failed to fetch URL: ${response.status}`);
      return new Response(
        JSON.stringify({ success: false, error: `HTTP ${response.status}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await response.text();

    // Extract title using regex
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    let title = titleMatch ? titleMatch[1].trim() : null;

    // Decode common HTML entities
    if (title) {
      title = title
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .trim();
    }

    // Extract Open Graph image
    let ogImage = null;
    
    // Try og:image first
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
                         html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["'][^>]*>/i);
    
    if (ogImageMatch) {
      ogImage = ogImageMatch[1];
    } else {
      // Try twitter:image as fallback
      const twitterImageMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
                                html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["'][^>]*>/i);
      if (twitterImageMatch) {
        ogImage = twitterImageMatch[1];
      }
    }

    // Make relative URLs absolute
    if (ogImage && !ogImage.startsWith('http')) {
      try {
        const baseUrl = new URL(url);
        ogImage = new URL(ogImage, baseUrl.origin).href;
      } catch {
        ogImage = null;
      }
    }

    console.log(`Extracted title: ${title}, ogImage: ${ogImage}`);

    return new Response(
      JSON.stringify({ success: true, title, ogImage, url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching link metadata:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
