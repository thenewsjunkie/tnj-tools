import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

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

const ActivePoll = () => {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    const fetchActivePoll = async () => {
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
        .single();

      if (error) {
        console.error('Error fetching active poll:', error);
        return;
      }

      if (polls) {
        setPoll({
          ...polls,
          options: polls.poll_options
        });
        setTotalVotes(polls.poll_options.reduce((sum, opt) => sum + (opt.votes || 0), 0));
      }
    };

    fetchActivePoll();

    // Subscribe to changes
    const pollsSubscription = supabase
      .channel('poll-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'polls' },
        fetchActivePoll
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'poll_options' },
        fetchActivePoll
      )
      .subscribe();

    return () => {
      pollsSubscription.unsubscribe();
    };
  }, []);

  if (!poll) {
    return (
      <div className="text-muted-foreground text-center py-8">
        No active poll
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="font-medium">{poll.question}</div>
      
      {poll.image_url && (
        <img 
          src={poll.image_url} 
          alt="Poll" 
          className="w-full h-32 object-cover rounded-md"
        />
      )}

      <div className="space-y-2">
        {poll.options.map((option) => {
          const percentage = totalVotes > 0 
            ? Math.round((option.votes / totalVotes) * 100) 
            : 0;
            
          return (
            <div key={option.id} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{option.text}</span>
                <span>{percentage}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="text-sm text-muted-foreground text-center">
        {totalVotes} total votes
      </div>
    </div>
  );
};

export default ActivePoll;