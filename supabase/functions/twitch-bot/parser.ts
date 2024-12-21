import { TwitchMessage } from "./types.ts";

export class MessageParser {
  static parseMessage(rawMessage: string): TwitchMessage | null {
    try {
      console.log("[MessageParser] Parsing message:", rawMessage);
      const regex = /.*:([^!]+).*PRIVMSG #([^ ]+) :(.+)/;
      const match = rawMessage.match(regex);
      if (match) {
        const message = {
          username: match[1],
          channel: match[2],
          message: match[3].trim(),
        };
        console.log("[MessageParser] Successfully parsed message:", message);
        return message;
      }
    } catch (error) {
      console.error("[MessageParser] Error parsing message:", error);
    }
    return null;
  }

  static parseSubscriptionMessage(rawMessage: string) {
    try {
      console.log("[MessageParser] Parsing subscription message:", rawMessage);
      const usernameMatch = rawMessage.match(/display-name=([^;]+)/);
      const username = usernameMatch ? usernameMatch[1] : null;

      if (username) {
        return {
          username,
          message: `${username} just subscribed!`,
        };
      }
    } catch (error) {
      console.error("[MessageParser] Error parsing subscription message:", error);
    }
    return null;
  }
}