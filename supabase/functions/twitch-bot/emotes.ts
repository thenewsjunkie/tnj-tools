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

      // Since we no longer store emotes in the database, we'll just return the fetched data
      return emotesData;
    } catch (error) {
      console.error("[EmoteManager] Error fetching channel emotes:", error);
      throw error;
    }
  }
}