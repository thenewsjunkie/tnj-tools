export interface TwitchConfig {
  channel: string;
  clientId: string;
  clientSecret: string;
}

export const validateConfig = (config: TwitchConfig): void => {
  if (!config.channel) throw new Error("Missing TWITCH_CHANNEL_NAME");
  if (!config.clientId) throw new Error("Missing TWITCH_CLIENT_ID");
  if (!config.clientSecret) throw new Error("Missing TWITCH_CLIENT_SECRET");
  
  console.log("[TwitchConfig] Configuration validated:", {
    channel: config.channel,
    hasClientId: !!config.clientId,
    hasClientSecret: !!config.clientSecret
  });
};