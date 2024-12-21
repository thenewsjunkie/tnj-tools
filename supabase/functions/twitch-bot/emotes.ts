export class EmoteManager {
  static async fetchAndStoreChannelEmotes(channelId: string, accessToken: string, clientId: string) {
    try {
      console.log("[EmoteManager] Fetching channel emotes...");
      
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
        throw new Error(`Failed to fetch emotes: ${emotesResponse.status}`);
      }

      const emotesData = await emotesResponse.json();
      console.log("[EmoteManager] Fetched channel emotes:", emotesData);

      // Store emotes in the database
      const { data: supabaseData, error } = await (await fetch(
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
                '1.0': emote.images['url_1x'],
                '2.0': emote.images['url_2x'],
                '3.0': emote.images['url_3x']
              }
            }))
          )
        }
      )).json();

      if (error) {
        throw error;
      }

      console.log("[EmoteManager] Successfully stored channel emotes");
      return emotesData;
    } catch (error) {
      console.error("[EmoteManager] Error fetching channel emotes:", error);
      throw error;
    }
  }
}