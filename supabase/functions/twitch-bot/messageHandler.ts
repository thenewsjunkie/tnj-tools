import { TwitchMessage } from "./types";
import { forwardToWebhook } from "./webhook";

export class MessageHandler {
  constructor(private channel: string) {
    console.log("[MessageHandler] Initialized for channel:", channel);
  }

  async handleMessage(ws: WebSocket, message: string) {
    console.log("[MessageHandler] Processing message:", message);

    if (message.includes("PING")) {
      ws.send("PONG :tmi.twitch.tv");
      console.log("[MessageHandler] Responded to PING");
      return;
    }

    if (message.includes("Login authentication failed")) {
      console.error("[MessageHandler] Authentication failed");
      throw new Error("Login authentication failed");
    }

    if (message.includes(`JOIN #${this.channel}`)) {
      console.log("[MessageHandler] Successfully joined channel!");
    }

    // Forward relevant messages to webhook
    if (message.includes("PRIVMSG")) {
      await this.forwardChatMessage(message);
    }
  }

  private async forwardChatMessage(message: string) {
    try {
      await forwardToWebhook({
        type: "chat",
        message: message,
        channel: this.channel
      });
    } catch (error) {
      console.error("[MessageHandler] Error forwarding message:", error);
    }
  }

  async sendMessage(ws: WebSocket, message: string) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error("[MessageHandler] Cannot send message - WebSocket not ready");
      throw new Error("WebSocket not ready");
    }

    try {
      ws.send(`PRIVMSG #${this.channel} :${message}`);
      console.log("[MessageHandler] Message sent:", message);
    } catch (error) {
      console.error("[MessageHandler] Error sending message:", error);
      throw error;
    }
  }
}