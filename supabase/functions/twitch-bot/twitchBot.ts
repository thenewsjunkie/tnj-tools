import { TwitchMessage, BotConfig } from "./types.ts";
import { TwitchConnection } from "./connection.ts";
import { MessageParser } from "./parser.ts";
import { EmoteManager } from "./emotes.ts";
import { forwardToWebhook } from "./webhook.ts";

export class TwitchBot {
  private connection: TwitchConnection;
  private isConnected: boolean = false;

  constructor(config: BotConfig) {
    console.log("[TwitchBot] Initializing with channel:", config.channel);
    this.connection = new TwitchConnection(
      config,
      this.handleMessage.bind(this),
      this.handleConnectionChange.bind(this)
    );
  }

  private async handleMessage(message: string) {
    try {
      console.log("[TwitchBot] Processing message:", message);

      if (message.includes("USERNOTICE")) {
        console.log("[TwitchBot] Processing subscription message");
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
        console.log("[TwitchBot] Processing chat message");
        const parsedMessage = MessageParser.parseMessage(message);
        if (parsedMessage) {
          await forwardToWebhook({
            type: "chat",
            ...parsedMessage
          });
        }
      }
    } catch (error) {
      console.error("[TwitchBot] Error handling message:", error);
    }
  }

  private handleConnectionChange(status: boolean) {
    console.log("[TwitchBot] Connection status changed:", status);
    this.isConnected = status;
  }

  async connect() {
    try {
      console.log("[TwitchBot] Initiating connection...");
      
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
      console.error("[TwitchBot] Connection error:", error);
      throw error;
    }
  }

  async disconnect() {
    console.log("[TwitchBot] Disconnecting...");
    await this.connection.disconnect();
  }

  getStatus(): string {
    return this.connection.getStatus();
  }
}