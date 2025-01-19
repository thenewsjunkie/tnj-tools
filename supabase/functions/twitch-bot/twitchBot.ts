import { TwitchMessage, BotConfig } from "./types.ts";
import { TwitchConnection } from "./connection.ts";
import { MessageParser } from "./parser.ts";
import { supabase } from "./supabaseClient.ts";

export class TwitchBot {
  private connection: TwitchConnection;
  private isConnected: boolean = false;

  constructor(config: BotConfig) {
    console.log("[TwitchBot] Initializing with channel:", config.channel);
    this.connection = new TwitchConnection(
      config,
      this.handleMessage.bind(this),
      this.handleConnectionChange.bind(this)
    );
  }

  private async handleMessage(message: string) {
    try {
      console.log("[TwitchBot] Processing message:", message);

      if (message.includes("PRIVMSG")) {
        const parsedMessage = MessageParser.parseMessage(message);
        if (parsedMessage) {
          await this.processVote(parsedMessage.username, parsedMessage.message.trim());
        }
      }
    } catch (error) {
      console.error("[TwitchBot] Error handling message:", error);
    }
  }

  private async processVote(username: string, message: string) {
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

      if (pollError || !poll) {
        console.log("[TwitchBot] No active poll found");
        return;
      }

      // Find matching option
      const matchingOption = poll.poll_options.find(
        option => option.text.toLowerCase() === message.toLowerCase()
      );

      if (!matchingOption) {
        console.log("[TwitchBot] No matching poll option for message:", message);
        return;
      }

      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('poll_votes')
        .select('id')
        .eq('poll_id', poll.id)
        .eq('username', username)
        .eq('platform', 'twitch')
        .single();

      if (existingVote) {
        console.log(`[TwitchBot] User ${username} already voted in this poll`);
        return;
      }

      // Record the vote
      const { error: voteError } = await supabase
        .from('poll_votes')
        .insert({
          poll_id: poll.id,
          option_id: matchingOption.id,
          username: username,
          platform: 'twitch'
        });

      if (voteError) {
        console.error('[TwitchBot] Error recording vote:', voteError);
        return;
      }

      // Increment the vote count
      await supabase.rpc('increment_poll_option_votes', { 
        option_id: matchingOption.id 
      });

      console.log(`[TwitchBot] Recorded vote from ${username} for option: ${matchingOption.text}`);
    } catch (error) {
      console.error('[TwitchBot] Error processing vote:', error);
    }
  }

  private handleConnectionChange(status: boolean) {
    this.isConnected = status;
    this.updateBotStatus(status ? 'connected' : 'disconnected');
  }

  async connect() {
    try {
      console.log('[TwitchBot] Starting connection...');
      
      // Get OAuth token
      const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
          client_id: this.connection.config.clientId,
          client_secret: this.connection.config.clientSecret,
          grant_type: 'client_credentials'
        })
      });

      if (!tokenResponse.ok) {
        throw new Error(`Failed to get OAuth token: ${tokenResponse.status}`);
      }

      const { access_token } = await tokenResponse.json();
      
      // Connect with credentials - use 'justinfan123' as username for anonymous chat
      await this.connection.connect(access_token, 'justinfan123', this.connection.config.channel);
      this.isConnected = true;
      await this.updateBotStatus('connected');
    } catch (error) {
      console.error('[TwitchBot] Connection error:', error);
      await this.updateBotStatus('disconnected', error.message);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.disconnect();
      this.isConnected = false;
      await this.updateBotStatus('disconnected');
    }
  }

  getStatus(): string {
    return this.isConnected ? 'connected' : 'disconnected';
  }

  private async updateBotStatus(status: 'connected' | 'disconnected', errorMessage?: string) {
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
      console.error('[TwitchBot] Error updating bot status:', error);
    }
  }
}
