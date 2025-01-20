import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type PollOption = {
  id: string;
  text: string;
  votes: number;
}

type Poll = {
  id: string;
  question: string;
  image_url: string | null;
  options: PollOption[];
}

type RealtimePayload<T> = {
  new: T;
  old: T;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
}

const PollsOBS = () => {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [totalVotes, setTotalVotes] = useState(0);

  const fetchActivePoll = async () => {
    console.log('OBS: Fetching active poll...');
    const { data: polls, error } = await supabase
      .from('polls')
      .select(`
        id,
        question,
        image_url,
        poll_options (
          id,
          text,
          votes
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('OBS: Error fetching active poll:', error);
      return;
    }

    if (polls) {
      console.log('OBS: Active poll found:', polls);
      const formattedPoll = {
        ...polls,
        options: polls.poll_options
      };
      setPoll(formattedPoll);
      setTotalVotes(polls.poll_options.reduce((sum, opt) => sum + (opt.votes || 0), 0));
    } else {
      console.log('OBS: No active poll found');
      setPoll(null);
      setTotalVotes(0);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchActivePoll();

    // Set up real-time subscriptions
    const channel = supabase.channel('obs-poll-updates')
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'polls',
          filter: 'status=eq.active'
        },
        async (payload: RealtimePayload<Database['public']['Tables']['polls']['Row']>) => {
          console.log('OBS: Poll change detected:', payload);
          await fetchActivePoll(); // Refetch entire poll data to ensure consistency
        }
      )
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'poll_options'
        },
        async (payload: RealtimePayload<Database['public']['Tables']['poll_options']['Row']>) => {
          console.log('OBS: Poll option change detected:', payload);
          // Only update if we have an active poll and the changed option belongs to it
          if (poll && payload.new && poll.options.some(opt => opt.id === payload.new.id)) {
            await fetchActivePoll(); // Refetch to ensure we have latest state
          }
        }
      )
      .subscribe((status) => {
        console.log('OBS: Subscription status:', status);
      });

    return () => {
      console.log('OBS: Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [poll?.id]); // Only re-subscribe when poll ID changes

  if (!poll) {
    return null; // Return empty for OBS when no active poll
  }

  return (
    <div className="min-h-screen bg-transparent text-white p-8">
      <div className="space-y-4">
        <div className="text-2xl font-bold">{poll.question}</div>
        
        {poll.image_url && (
          <img 
            src={poll.image_url} 
            alt="Poll" 
            className="w-full h-32 object-cover rounded-md"
          />
        )}

        <div className="space-y-3">
          {poll.options.map((option) => {
            const percentage = totalVotes > 0 
              ? Math.round((option.votes / totalVotes) * 100) 
              : 0;
              
            return (
              <div key={option.id} className="space-y-1">
                <div className="flex justify-between text-lg">
                  <span>{option.text}</span>
                  <span>{percentage}%</span>
                </div>
                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="text-base text-white/70 text-center">
          {totalVotes} total votes
        </div>
      </div>
    </div>
  );
};

export default PollsOBS;