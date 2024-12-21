import { supabase } from '../utils/supabase.js';

export function setupMessageHandler(twitchBot, youtubeBot) {
  // Listen for messages from Supabase that need to be sent to chat platforms
  const channel = supabase
    .channel('chat_outbound')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: 'source=eq.megachat'
      },
      async (payload) => {
        const message = payload.new;
        
        // Send to both platforms
        try {
          if (twitchBot.isConnected) {
            await twitchBot.sendMessage(message.message);
          }
          if (youtubeBot.isConnected) {
            await youtubeBot.sendMessage(message.message);
          }
        } catch (error) {
          console.error('Error sending message:', error);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}