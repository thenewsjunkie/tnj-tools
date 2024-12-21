import WebSocket from 'ws';
import { supabase } from '../utils/supabase.js';

export class YouTubeBot {
  constructor(config) {
    this.config = config;
    this.ws = null;
    this.liveChatId = null;
    this.nextPageToken = null;
    this.pollInterval = 5000;
    this.isConnected = false;
    this.pollTimeoutId = null;
  }

  async connect() {
    try {
      await this.getLiveChatId();
      if (this.liveChatId) {
        this.isConnected = true;
        await this.updateBotStatus('connected');
        this.pollMessages();
      } else {
        throw new Error('No live chat ID found');
      }
    } catch (error) {
      console.error('Error connecting to YouTube:', error);
      await this.updateBotStatus('disconnected', error.message);
      throw error;
    }
  }

  async disconnect() {
    this.isConnected = false;
    if (this.pollTimeoutId) {
      clearTimeout(this.pollTimeoutId);
    }
    await this.updateBotStatus('disconnected');
  }

  async getLiveChatId() {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${this.config.videoId}&key=${this.config.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.items?.[0]?.liveStreamingDetails?.activeLiveChatId) {
        this.liveChatId = data.items[0].liveStreamingDetails.activeLiveChatId;
      } else {
        throw new Error('No live chat found for this video');
      }
    } catch (error) {
      console.error('Error getting live chat ID:', error);
      throw error;
    }
  }

  async sendMessage(message) {
    if (!this.isConnected) {
      throw new Error('Bot is not connected to YouTube');
    }
    // Note: Sending messages requires OAuth2 authentication and additional setup
    console.log('YouTube message sending not implemented yet');
  }

  async pollMessages() {
    if (!this.isConnected || !this.liveChatId) return;

    try {
      const url = new URL('https://www.googleapis.com/youtube/v3/liveChat/messages');
      url.searchParams.append('part', 'snippet,authorDetails');
      url.searchParams.append('liveChatId', this.liveChatId);
      url.searchParams.append('key', this.config.apiKey);
      if (this.nextPageToken) {
        url.searchParams.append('pageToken', this.nextPageToken);
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.nextPageToken = data.nextPageToken;
      this.pollInterval = data.pollingIntervalMillis || 5000;

      for (const item of data.items) {
        await this.handleMessage({
          username: item.authorDetails.displayName,
          message: item.snippet.displayMessage,
          superChat: item.snippet.superChatDetails
        });
      }

      if (this.isConnected) {
        this.pollTimeoutId = setTimeout(() => this.pollMessages(), this.pollInterval);
      }
    } catch (error) {
      console.error('Error polling messages:', error);
      if (this.isConnected) {
        this.pollTimeoutId = setTimeout(() => this.pollMessages(), 10000);
      }
    }
  }

  async handleMessage(messageData) {
    try {
      await supabase.from('chat_messages').insert({
        source: 'youtube',
        username: messageData.username,
        message: messageData.message,
        message_type: messageData.superChat ? 'superchat' : 'chat',
        superchat_amount: messageData.superChat?.amount,
        metadata: {}
      });
    } catch (error) {
      console.error('Error storing YouTube message:', error);
    }
  }

  async updateBotStatus(status, errorMessage = null) {
    try {
      await supabase.from('bot_instances').upsert({
        type: 'youtube',
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