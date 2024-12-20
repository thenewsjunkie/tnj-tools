import { TwitchMessage, BotConfig } from "./types.ts";
import { forwardToWebhook } from "./webhook.ts";

export class TwitchBot {
  private ws: WebSocket | null = null;
  private channel: string;
  private clientId: string;
  private clientSecret: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private isConnected: boolean = false;

  constructor(config: BotConfig) {
    this.channel = config.channel.toLowerCase();
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    console.log("[TwitchBot] Constructor called with channel:", this.channel);
  }

  async connect() {
    try {
      console.log("[TwitchBot] Starting connection attempt...");
      console.log("[TwitchBot] Connecting to channel:", this.channel);
      
      const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials',
          scope: 'chat:read'
        })
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        console.error("[TwitchBot] OAuth token error:", errorData);
        throw new Error(`Failed to get OAuth token: ${tokenResponse.status} ${errorData}`);
      }

      const { access_token } = await tokenResponse.json();
      console.log("[TwitchBot] Successfully obtained OAuth token");

      // Fetch channel emotes before connecting to chat
      await this.fetchAndStoreChannelEmotes(access_token);
      
      this.ws = new WebSocket("wss://irc-ws.chat.twitch.tv:443/");

      this.ws.onopen = () => {
        console.log("[TwitchBot] WebSocket connection established");
        this.isConnected = true;
        const botUsername = "justinfan" + Math.floor(Math.random() * 100000);
        this.authenticate(access_token, botUsername);
      };

      this.ws.onmessage = async (event) => {
        const message = event.data;
        console.log("[TwitchBot] Received IRC message:", message);

        if (message.includes("PING")) {
          this.ws?.send("PONG :tmi.twitch.tv");
          console.log("[TwitchBot] Responded to PING");
          return;
        }

        if (message.includes("Login authentication failed")) {
          console.error("[TwitchBot] Login authentication failed. Check credentials.");
          return;
        }

        if (message.includes(`JOIN #${this.channel}`)) {
          console.log("[TwitchBot] Successfully joined channel!");
        }

        // Handle subscription messages
        if (message.includes("USERNOTICE")) {
          console.log("[TwitchBot] Processing subscription message:", message);
          const subInfo = this.parseSubscriptionMessage(message);
          if (subInfo) {
            await forwardToWebhook({
              type: "subscription",
              username: subInfo.username,
              message: subInfo.message,
              channel: this.channel
            });
          }
          return;
        }

        // Handle regular chat messages
        if (message.includes("PRIVMSG")) {
          console.log("[TwitchBot] Processing chat message:", message);
          const parsedMessage = this.parseMessage(message);
          if (parsedMessage) {
            await forwardToWebhook({
              type: "chat",
              ...parsedMessage
            });
          }
        }
      };

      this.ws.onclose = () => {
        console.log("[TwitchBot] WebSocket connection closed");
        this.isConnected = false;
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("[TwitchBot] WebSocket error:", error);
        this.isConnected = false;
      };
    } catch (error) {
      console.error("[TwitchBot] Error in connect method:", error);
      this.isConnected = false;
      throw error;
    }
  }

  private async fetchAndStoreChannelEmotes(accessToken: string) {
    try {
      console.log("[TwitchBot] Fetching channel emotes...");
      
      // First, get the channel ID
      const channelResponse = await fetch(
        `https://api.twitch.tv/helix/users?login=${this.channel}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Client-Id': this.clientId
          }
        }
      );

      if (!channelResponse.ok) {
        throw new Error(`Failed to fetch channel info: ${channelResponse.status}`);
      }

      const channelData = await channelResponse.json();
      const channelId = channelData.data[0]?.id;

      if (!channelId) {
        throw new Error('Channel not found');
      }

      // Fetch channel emotes
      const emotesResponse = await fetch(
        `https://api.twitch.tv/helix/chat/emotes?broadcaster_id=${channelId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Client-Id': this.clientId
          }
        }
      );

      if (!emotesResponse.ok) {
        throw new Error(`Failed to fetch emotes: ${emotesResponse.status}`);
      }

      const emotesData = await emotesResponse.json();
      console.log("[TwitchBot] Fetched channel emotes:", emotesData);

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

      console.log("[TwitchBot] Successfully stored channel emotes");
    } catch (error) {
      console.error("[TwitchBot] Error fetching channel emotes:", error);
    }
  }

  async disconnect() {
    console.log("[TwitchBot] Disconnecting...");
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  private authenticate(accessToken: string, username: string) {
    console.log("[TwitchBot] Sending authentication commands...");
    this.ws?.send("CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership");
    this.ws?.send(`PASS oauth:${accessToken}`);
    this.ws?.send(`NICK ${username}`);
    this.ws?.send(`JOIN #${this.channel}`);
    
    this.reconnectAttempts = 0;
    console.log("[TwitchBot] Authentication commands sent, waiting for channel join confirmation");
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[TwitchBot] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => this.connect(), 5000 * this.reconnectAttempts);
    } else {
      console.error("[TwitchBot] Max reconnection attempts reached");
    }
  }

  private parseMessage(rawMessage: string): TwitchMessage | null {
    try {
      console.log("[TwitchBot] Parsing message:", rawMessage);
      const regex = /.*:([^!]+).*PRIVMSG #([^ ]+) :(.+)/;
      const match = rawMessage.match(regex);
      if (match) {
        const message = {
          username: match[1],
          channel: match[2],
          message: match[3].trim(),
        };
        console.log("[TwitchBot] Successfully parsed message:", message);
        return message;
      }
    } catch (error) {
      console.error("[TwitchBot] Error parsing message:", error);
    }
    return null;
  }

  private parseSubscriptionMessage(rawMessage: string) {
    try {
      console.log("[TwitchBot] Parsing subscription message:", rawMessage);
      // Extract username from the USERNOTICE tags
      const usernameMatch = rawMessage.match(/display-name=([^;]+)/);
      const username = usernameMatch ? usernameMatch[1] : null;

      if (username) {
        return {
          username,
          message: `${username} just subscribed!`,
        };
      }
    } catch (error) {
      console.error("[TwitchBot] Error parsing subscription message:", error);
    }
    return null;
  }

  getStatus(): string {
    return this.isConnected ? "Connected" : "Disconnected";
  }
}
