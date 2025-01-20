import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePollSubscription } from "@/hooks/usePollSubscription";

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

  // Use the same subscription hook that works in ActivePoll
  usePollSubscription(fetchActivePoll);

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