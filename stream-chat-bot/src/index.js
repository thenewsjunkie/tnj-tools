import dotenv from 'dotenv';
import { TwitchBot } from './bots/twitch.js';
import { YouTubeBot } from './bots/youtube.js';
import { setupMessageHandler } from './handlers/messageHandler.js';

dotenv.config();

// Initialize bots
const twitchBot = new TwitchBot({
  channel: process.env.TWITCH_CHANNEL,
  clientId: process.env.TWITCH_CLIENT_ID,
  clientSecret: process.env.TWITCH_CLIENT_SECRET
});

const youtubeBot = new YouTubeBot({
  apiKey: process.env.YOUTUBE_API_KEY,
  channelId: process.env.YOUTUBE_CHANNEL_ID
});

// Set up message handling
setupMessageHandler(twitchBot, youtubeBot);

// Start bots
async function startBots() {
  try {
    console.log('Starting chat bots...');
    await Promise.all([
      twitchBot.connect(),
      youtubeBot.connect()
    ]);
    console.log('Both bots connected successfully!');
  } catch (error) {
    console.error('Error starting bots:', error);
    process.exit(1);
  }
}

startBots();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Shutting down bots...');
  await twitchBot.disconnect();
  await youtubeBot.disconnect();
  process.exit(0);
});