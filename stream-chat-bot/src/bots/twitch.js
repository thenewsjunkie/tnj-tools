import tmi from 'tmi.js';
import { supabase } from '../utils/supabase.js';

export class TwitchBot {
  constructor(config) {
    this.config = config;
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      // Get OAuth token
      const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          grant_type: 'client_credentials'
        })
      });

      if (!tokenResponse.ok) {
        throw new Error(`Failed to get OAuth token: ${tokenResponse.status}`);
      }

      const { access_token } = await tokenResponse.json();

      // Initialize TMI client
      this.client = new tmi.Client({
        options: { debug: true },
        identity: {
          username: this.config.channel,
          password: `oauth:${access_token}`
        },
        channels: [this.config.channel]
      });

      // Set up event handlers
      this.client.on('message', this.handleMessage.bind(this));
      this.client.on('connected', this.handleConnect.bind(this));
      this.client.on('disconnected', this.handleDisconnect.bind(this));

      await this.client.connect();
      this.isConnected = true;
      
      await this.updateBotStatus('connected');
    } catch (error) {
      console.error('Error connecting to Twitch:', error);
      await this.updateBotStatus('disconnected', error.message);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.disconnect();
      this.isConnected = false;
      await this.updateBotStatus('disconnected');
    }
  }

  async sendMessage(message) {
    if (!this.isConnected) {
      throw new Error('Bot is not connected to Twitch');
    }
    await this.client.say(this.config.channel, message);
  }

  async handleMessage(channel, tags, message, self) {
    if (self) return;

    try {
      await supabase.from('chat_messages').insert({
        source: 'twitch',
        username: tags['display-name'],
        message: message,
        message_type: 'chat',
        metadata: {
          color: tags.color,
          badges: tags.badges,
          emotes: tags.emotes
        }
      });
    } catch (error) {
      console.error('Error storing Twitch message:', error);
    }
  }

  async handleConnect() {
    console.log('Connected to Twitch chat');
    await this.updateBotStatus('connected');
  }

  async handleDisconnect() {
    console.log('Disconnected from Twitch chat');
    this.isConnected = false;
    await this.updateBotStatus('disconnected');
  }

  async updateBotStatus(status, errorMessage = null) {
    try {
      await supabase.from('bot_instances').upsert({
        type: 'twitch',
        status: status,
        error_message: errorMessage,
        last_heartbeat: new Date().toISOString()
      }, {
        onConflict: 'type'
      });
    } catch (error) {
      console.error('Error updating bot status:', error);
    }
  }
}