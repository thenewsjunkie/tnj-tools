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
      // Initialize TMI client with stored access token
      this.client = new tmi.Client({
        options: { debug: true },
        identity: {
          username: this.config.channel,
          password: `oauth:${process.env.TWITCH_ACCESS_TOKEN}`
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
      // Store the chat message
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

      // Check for active poll and process vote
      await this.processVote(tags['display-name'], message.trim());

    } catch (error) {
      console.error('Error handling Twitch message:', error);
    }
  }

  async processVote(username, message) {
    try {
      // Get active poll
      const { data: poll, error: pollError } = await supabase
        .from('polls')
        .select(`
          id,
          poll_options (
            id,
            text
          )
        `)
        .eq('status', 'active')
        .single();

      if (pollError || !poll) return;

      // Find matching option
      const matchingOption = poll.poll_options.find(
        option => option.text.toLowerCase() === message.toLowerCase()
      );

      if (!matchingOption) return;

      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('poll_votes')
        .select('id')
        .eq('poll_id', poll.id)
        .eq('username', username)
        .eq('platform', 'twitch')
        .single();

      if (existingVote) {
        console.log(`User ${username} already voted in this poll`);
        return;
      }

      // Record the vote
      const { error: voteError } = await supabase.from('poll_votes').insert({
        poll_id: poll.id,
        option_id: matchingOption.id,
        username: username,
        platform: 'twitch'
      });

      if (voteError) {
        console.error('Error recording vote:', voteError);
        return;
      }

      // Increment the vote count
      await supabase.rpc('increment_poll_option_votes', { 
        option_id: matchingOption.id 
      });

      console.log(`Recorded vote from ${username} for option: ${matchingOption.text}`);
    } catch (error) {
      console.error('Error processing vote:', error);
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
