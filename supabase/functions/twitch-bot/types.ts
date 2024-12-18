export interface TwitchMessage {
  username: string;
  channel: string;
  message: string;
}

export interface BotConfig {
  channel: string;
  clientId: string;
  clientSecret: string;
}