export interface TwitchMessage {
  username: string;
  channel: string;
  message: string;
}

export interface BotConfig {
  channelName: string;
  clientId: string;
  clientSecret: string;
}