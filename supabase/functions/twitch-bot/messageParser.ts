import { TwitchMessage } from "./types.ts";

export const parseMessage = (rawMessage: string): TwitchMessage | null => {
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
};

export const parseSubscriptionMessage = (rawMessage: string) => {
  try {
    console.log("[TwitchBot] Parsing subscription message:", rawMessage);
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
};