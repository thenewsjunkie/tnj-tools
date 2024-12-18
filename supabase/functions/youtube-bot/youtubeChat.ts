interface YouTubeChatConfig {
  videoId: string;
  apiKey: string;
  clientId: string;
  clientSecret: string;
}

interface ChatMessage {
  author: {
    name: string;
    channelId: string;
  };
  message: string;
  superChat?: {
    amount: number;
    currency: string;
  };
}

export class YouTubeChat {
  private config: YouTubeChatConfig;
  private liveChatId: string | null = null;
  private nextPageToken: string | null = null;
  private pollInterval: number = 5000;
  private isRunning: boolean = false;
  private pollTimeoutId: number | null = null;

  constructor(config: YouTubeChatConfig) {
    this.config = config;
    console.log("YouTubeChat initialized for video:", config.videoId);
  }

  async start() {
    try {
      console.log("Starting YouTube chat listener...");
      await this.getLiveChatId();
      if (this.liveChatId) {
        this.isRunning = true;
        this.pollMessages();
      }
    } catch (error) {
      console.error("Error starting YouTube chat:", error);
      throw error;
    }
  }

  async stop() {
    console.log("Stopping YouTube chat listener...");
    this.isRunning = false;
    if (this.pollTimeoutId) {
      clearTimeout(this.pollTimeoutId);
    }
  }

  private async getLiveChatId() {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${this.config.videoId}&key=${this.config.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.items && data.items[0]?.liveStreamingDetails?.activeLiveChatId) {
        this.liveChatId = data.items[0].liveStreamingDetails.activeLiveChatId;
        console.log("Retrieved live chat ID:", this.liveChatId);
      } else {
        throw new Error("No live chat found for this video");
      }
    } catch (error) {
      console.error("Error getting live chat ID:", error);
      throw error;
    }
  }

  private async pollMessages() {
    if (!this.isRunning || !this.liveChatId) return;

    try {
      const url = new URL("https://www.googleapis.com/youtube/v3/liveChat/messages");
      url.searchParams.append("part", "snippet,authorDetails");
      url.searchParams.append("liveChatId", this.liveChatId);
      url.searchParams.append("key", this.config.apiKey);
      if (this.nextPageToken) {
        url.searchParams.append("pageToken", this.nextPageToken);
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.nextPageToken = data.nextPageToken;
      this.pollInterval = data.pollingIntervalMillis || 5000;

      for (const item of data.items) {
        const message: ChatMessage = {
          author: {
            name: item.authorDetails.displayName,
            channelId: item.authorDetails.channelId,
          },
          message: item.snippet.displayMessage,
        };

        if (item.snippet.superChatDetails) {
          message.superChat = {
            amount: item.snippet.superChatDetails.amountMicros / 1000000,
            currency: item.snippet.superChatDetails.currency,
          };
        }

        await this.forwardMessage(message);
      }

      if (this.isRunning) {
        this.pollTimeoutId = setTimeout(() => this.pollMessages(), this.pollInterval);
      }
    } catch (error) {
      console.error("Error polling messages:", error);
      if (this.isRunning) {
        this.pollTimeoutId = setTimeout(() => this.pollMessages(), 10000); // Retry after 10 seconds on error
      }
    }
  }

  private async forwardMessage(message: ChatMessage) {
    try {
      const webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/chat-webhooks`;
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform: "youtube",
          type: message.superChat ? "superchat" : "chat",
          data: {
            username: message.author.name,
            message: message.message,
            superChat: message.superChat,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook error! status: ${response.status}`);
      }

      console.log("Message forwarded successfully:", message);
    } catch (error) {
      console.error("Error forwarding message:", error);
    }
  }
}