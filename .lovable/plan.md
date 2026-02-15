

## Fix X/Twitter Thumbnail Fetching

### Problem
Twitter's oEmbed API (currently used) does not return any image data — it only provides the tweet text and author. So `ogImage` is always `null` for X/Twitter links.

### Solution
Use the **FxTwitter API** (`api.fxtwitter.com`) instead. This is a free, public API that requires no authentication and returns tweet media data including video thumbnails and images.

### How it works

1. Extract the tweet ID from the URL (e.g., `x.com/user/status/123456` yields `123456`)
2. Call `https://api.fxtwitter.com/status/{tweetId}`
3. The response includes media objects with `thumbnail_url` (for videos) and `url` (for images)
4. Use the first available media thumbnail/image as `ogImage`
5. Keep the existing oEmbed call as a fallback for the tweet title/text

### Change

**File: `supabase/functions/fetch-link-metadata/index.ts`**

Update the `fetchTweetMetadata` function to:

```
async function fetchTweetMetadata(url: string) {
  // 1. Extract tweet ID from URL
  const tweetIdMatch = url.match(/status\/(\d+)/);
  const tweetId = tweetIdMatch?.[1];

  let ogImage: string | null = null;

  // 2. Try FxTwitter API for media/thumbnail
  if (tweetId) {
    try {
      const fxResponse = await fetch(`https://api.fxtwitter.com/status/${tweetId}`);
      if (fxResponse.ok) {
        const fxData = await fxResponse.json();
        const media = fxData?.tweet?.media?.all;
        if (media?.length > 0) {
          ogImage = media[0].thumbnail_url || media[0].url || null;
        }
      }
    } catch (e) {
      console.log("FxTwitter API failed, continuing without thumbnail");
    }
  }

  // 3. Still use oEmbed for the title (tweet text + author)
  // ... existing oEmbed logic stays the same ...

  return { title, ogImage };
}
```

One file change, then the edge function auto-redeploys.

