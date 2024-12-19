export interface TwitchMessage {
  username: string;
  channel: string;
  message: string;
  type?: "chat" | "subscription";
}

export interface BotConfig {
  channel: string;
  clientId: string;
  clientSecret: string;
}