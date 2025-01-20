import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  image_url: string | null;
  options: PollOption[];
}

// Define types for the real-time payload
type RealtimePayload<T> = {
  commit_timestamp: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  schema: string;
  table: string;
  old: T | null;
  new: T;
};

type PollRow = Database['public']['Tables']['polls']['Row'];
type PollOptionRow = Database['public']['Tables']['poll_options']['Row'];

const PollsOBS = () => {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [totalVotes, setTotalVotes] = useState(0);

  // Initial fetch of active poll
  useEffect(() => {
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
        setPoll({
          ...polls,
          options: polls.poll_options
        });
        setTotalVotes(polls.poll_options.reduce((sum, opt) => sum + (opt.votes || 0), 0));
      } else {
        console.log('OBS: No active poll found');
        setPoll(null);
        setTotalVotes(0);
      }
    };

    fetchActivePoll();

    // Set up real-time subscriptions
    const channel = supabase.channel('obs-poll-updates')
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'polls'
        },
        async (payload: RealtimePayload<PollRow>) => {
          console.log('OBS: Poll change detected:', payload);
          if (payload.eventType === 'DELETE' || (payload.eventType === 'UPDATE' && payload.new.status !== 'active')) {
            setPoll(null);
            setTotalVotes(0);
            return;
          }
          
          if (payload.new.status === 'active') {
            // Fetch the complete poll data including options
            const { data: pollData } = await supabase
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
              .eq('id', payload.new.id)
              .single();

            if (pollData) {
              setPoll({
                ...pollData,
                options: pollData.poll_options
              });
              setTotalVotes(pollData.poll_options.reduce((sum, opt) => sum + (opt.votes || 0), 0));
            }
          }
        }
      )
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'poll_options'
        },
        (payload: RealtimePayload<PollOptionRow>) => {
          console.log('OBS: Poll option change detected:', payload);
          setPoll(currentPoll => {
            if (!currentPoll) return null;
            
            const updatedOptions = currentPoll.options.map(option => {
              if (option.id === payload.new.id) {
                return { ...option, ...payload.new };
              }
              return option;
            });
            
            const newTotalVotes = updatedOptions.reduce((sum, opt) => sum + (opt.votes || 0), 0);
            setTotalVotes(newTotalVotes);
            
            return {
              ...currentPoll,
              options: updatedOptions
            };
          });
        }
      )
      .subscribe((status) => {
        console.log('OBS: Subscription status:', status);
      });

    return () => {
      console.log('OBS: Cleaning up subscription');
      void supabase.removeChannel(channel);
    };
  }, []);

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