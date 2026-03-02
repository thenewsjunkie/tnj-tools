import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CNNBRK_USER_ID = "428333"; // @cnnbrk Twitter/X user ID

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const bearerToken = Deno.env.get("TWITTER_BEARER_TOKEN");
    if (!bearerToken) {
      return new Response(JSON.stringify({ error: "TWITTER_BEARER_TOKEN not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const url = new URL(req.url);
    const isTest = url.searchParams.get("test") === "true";

    if (isTest) {
      // Just fetch the latest tweet and insert it as a test alert
      const tweetsRes = await fetch(
        `https://api.x.com/2/users/${CNNBRK_USER_ID}/tweets?max_results=5&tweet.fields=created_at`,
        { headers: { Authorization: `Bearer ${bearerToken}` } }
      );

      if (!tweetsRes.ok) {
        const errText = await tweetsRes.text();
        return new Response(JSON.stringify({ error: "X API error", details: errText }), {
          status: tweetsRes.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const tweetsData = await tweetsRes.json();
      const latestTweet = tweetsData.data?.[0];

      if (!latestTweet) {
        return new Response(JSON.stringify({ error: "No tweets found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Insert as test alert (use a unique test ID to avoid conflicts)
      const testTweetId = `test_${Date.now()}`;
      const { error: insertError } = await supabase.from("news_alerts").insert({
        tweet_id: testTweetId,
        text: latestTweet.text,
        author: "@cnnbrk",
      });

      if (insertError) {
        return new Response(JSON.stringify({ error: "Insert failed", details: insertError }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, tweet: latestTweet.text }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Normal poll mode: fetch tweets since last seen
    const { data: setting } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "news_alerts_last_tweet_id")
      .maybeSingle();

    const lastSeenId = (setting?.value as any)?.tweet_id as string | undefined;

    let apiUrl = `https://api.x.com/2/users/${CNNBRK_USER_ID}/tweets?max_results=5&tweet.fields=created_at`;
    if (lastSeenId) {
      apiUrl += `&since_id=${lastSeenId}`;
    }

    const tweetsRes = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${bearerToken}` },
    });

    if (!tweetsRes.ok) {
      const errText = await tweetsRes.text();
      return new Response(JSON.stringify({ error: "X API error", details: errText }), {
        status: tweetsRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tweetsData = await tweetsRes.json();
    const tweets = tweetsData.data ?? [];

    if (tweets.length === 0) {
      return new Response(JSON.stringify({ success: true, newAlerts: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert new tweets
    const rows = tweets.map((t: any) => ({
      tweet_id: t.id,
      text: t.text,
      author: "@cnnbrk",
    }));

    const { error: insertError } = await supabase
      .from("news_alerts")
      .upsert(rows, { onConflict: "tweet_id", ignoreDuplicates: true });

    if (insertError) {
      console.error("Insert error:", insertError);
    }

    // Update last seen tweet ID (first tweet is newest)
    const newestId = tweets[0].id;
    await supabase.from("system_settings").upsert(
      { key: "news_alerts_last_tweet_id", value: { tweet_id: newestId }, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );

    return new Response(JSON.stringify({ success: true, newAlerts: tweets.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
