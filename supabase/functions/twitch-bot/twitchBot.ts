import { TwitchMessage, BotConfig } from "./types.ts";
import { TwitchConnection } from "./connection.ts";
import { MessageParser } from "./parser.ts";
import { EmoteManager } from "./emotes.ts";
import { forwardToWebhook } from "./webhook.ts";

export class TwitchBot {
  private connection: TwitchConnection;
  private isConnected: boolean = false;

  constructor(config: BotConfig) {
    this.connection = new TwitchConnection(
      config,
      this.handleMessage.bind(this),
      this.handleConnectionChange.bind(this)
    );
    console.log("[TwitchBot] Constructor called with channel:", config.channel);
  }

  private async handleMessage(message: string) {
    console.log("[TwitchBot] Received IRC message:", message);

    if (message.includes("USERNOTICE")) {
      console.log("[TwitchBot] Processing subscription message:", message);
      const subInfo = MessageParser.parseSubscriptionMessage(message);
      if (subInfo) {
        await forwardToWebhook({
          type: "subscription",
          username: subInfo.username,
          message: subInfo.message,
          channel: this.connection.config.channel
        });
      }
      return;
    }

    if (message.includes("PRIVMSG")) {
      console.log("[TwitchBot] Processing chat message:", message);
      const parsedMessage = MessageParser.parseMessage(message);
      if (parsedMessage) {
        await forwardToWebhook({
          type: "chat",
          ...parsedMessage
        });
      }
    }
  }

  private handleConnectionChange(status: boolean) {
    this.isConnected = status;
  }

  async connect() {
    try {
      console.log("[TwitchBot] Starting connection attempt...");
      
      const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
          client_id: this.connection.config.clientId,
          client_secret: this.connection.config.clientSecret,
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

      const botUsername = "justinfan" + Math.floor(Math.random() * 100000);
      await this.connection.connect(access_token, botUsername);
    } catch (error) {
      console.error("[TwitchBot] Error in connect method:", error);
      throw error;
    }
  }

  async disconnect() {
    await this.connection.disconnect();
  }

  getStatus(): string {
    return this.connection.getStatus();
  }
}