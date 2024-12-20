export const fetchAndStoreChannelEmotes = async (channelName: string, accessToken: string, clientId: string) => {
  try {
    console.log("[TwitchBot] Fetching channel emotes for:", channelName);
    
    // First, get the channel ID
    const channelResponse = await fetch(
      `https://api.twitch.tv/helix/users?login=${channelName}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Client-Id': clientId
        }
      }
    );

    if (!channelResponse.ok) {
      const errorText = await channelResponse.text();
      console.error("[TwitchBot] Failed to fetch channel info:", {
        status: channelResponse.status,
        error: errorText,
        headers: Object.fromEntries(channelResponse.headers.entries())
      });
      throw new Error(`Failed to fetch channel info: ${channelResponse.status} ${errorText}`);
    }

    const channelResponseText = await channelResponse.text();
    console.log("[TwitchBot] Raw channel response:", channelResponseText);

    let channelData;
    try {
      channelData = JSON.parse(channelResponseText);
    } catch (error) {
      console.error("[TwitchBot] Failed to parse channel response:", error);
      console.error("[TwitchBot] Raw response was:", channelResponseText);
      throw new Error('Failed to parse channel response');
    }

    console.log("[TwitchBot] Channel data response:", channelData);

    if (!channelData.data || !channelData.data[0]) {
      console.error("[TwitchBot] Channel not found:", channelName);
      throw new Error('Channel not found');
    }

    const channelId = channelData.data[0].id;
    console.log("[TwitchBot] Retrieved channel ID:", channelId);

    // Fetch channel emotes
    const emotesResponse = await fetch(
      `https://api.twitch.tv/helix/chat/emotes?broadcaster_id=${channelId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Client-Id': clientId
        }
      }
    );

    if (!emotesResponse.ok) {
      const errorText = await emotesResponse.text();
      console.error("[TwitchBot] Failed to fetch emotes:", {
        status: emotesResponse.status,
        error: errorText,
        headers: Object.fromEntries(emotesResponse.headers.entries())
      });
      throw new Error(`Failed to fetch emotes: ${emotesResponse.status} ${errorText}`);
    }

    const emotesResponseText = await emotesResponse.text();
    console.log("[TwitchBot] Raw emotes response:", emotesResponseText);

    let emotesData;
    try {
      emotesData = JSON.parse(emotesResponseText);
    } catch (error) {
      console.error("[TwitchBot] Failed to parse emotes response:", error);
      console.error("[TwitchBot] Raw response was:", emotesResponseText);
      throw new Error('Failed to parse emotes response');
    }

    console.log("[TwitchBot] Fetched channel emotes:", emotesData);

    if (!emotesData.data) {
      console.log("[TwitchBot] No emotes found for channel");
      return; // Exit gracefully if no emotes found
    }

    // Store emotes in the database
    const { error } = await (await fetch(
      `${Deno.env.get("SUPABASE_URL")}/rest/v1/twitch_channel_emotes`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          'apikey': Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || '',
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(
          emotesData.data.map((emote: any) => ({
            id: emote.id,
            name: emote.name,
            urls: {
              '1.0': emote.images.url_1x,
              '2.0': emote.images.url_2x,
              '3.0': emote.images.url_3x
            }
          }))
        )
      }
    )).json();

    if (error) {
      console.error("[TwitchBot] Error storing emotes:", error);
      throw error;
    }

    console.log("[TwitchBot] Successfully stored channel emotes");
  } catch (error) {
    console.error("[TwitchBot] Error in fetchAndStoreChannelEmotes:", error);
    // Don't throw the error, just log it - this allows the bot to continue connecting
    // even if emote fetching fails
  }
};