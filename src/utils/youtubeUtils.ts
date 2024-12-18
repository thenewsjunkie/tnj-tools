export const fetchLiveStreamId = async (channelId: string, apiKey: string) => {
  try {
    // First, get the live stream details
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=id&channelId=${channelId}&eventType=live&type=video&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch live stream');
    }

    const data = await response.json();
    
    // Check if there's an active live stream
    if (data.items && data.items.length > 0) {
      return data.items[0].id.videoId;
    }
    
    return null;
  } catch (error) {
    console.error('[YouTubeUtils] Error fetching live stream:', error);
    return null;
  }
};