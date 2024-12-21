# Stream Chat Bot

A Node.js chat bot that connects to Twitch and YouTube chats, integrated with Supabase for message storage and synchronization.

## Setup

1. Clone this repository
2. Copy `.env.example` to `.env` and fill in your credentials:
   - Supabase credentials
   - Twitch API credentials
   - YouTube API credentials
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run locally:
   ```bash
   npm run dev
   ```

## Deploying to Heroku

1. Create a new Heroku app
2. Set up the environment variables in Heroku settings
3. Deploy using Heroku Git:
   ```bash
   heroku login
   heroku git:remote -a your-app-name
   git push heroku main
   ```

## Features

- Connects to both Twitch and YouTube chats
- Stores messages in Supabase database
- Sends messages to both platforms
- Updates bot status in real-time
- Handles reconnections automatically
- Graceful shutdown handling