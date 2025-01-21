import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { usePollSubscription } from "@/hooks/usePollSubscription";

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
  const [isArchiving, setIsArchiving] = useState(false);
  const { toast } = useToast();

  const fetchActivePoll = async () => {
    console.log('Fetching active poll...');
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
      console.error('Error fetching active poll:', error);
      return;
    }

    if (polls) {
      console.log('Active poll found:', polls);
      setPoll({
        ...polls,
        options: polls.poll_options
      });
      setTotalVotes(polls.poll_options.reduce((sum, opt) => sum + (opt.votes || 0), 0));
    } else {
      console.log('No active poll found');
      setPoll(null);
      setTotalVotes(0);
    }
  };

  // Use the custom hook for subscriptions
  usePollSubscription(fetchActivePoll);

  const archivePoll = async () => {
    if (!poll) return;
    
    setIsArchiving(true);

    try {
      // End poll in Streamlabs
      const { error: streamlabsError } = await supabase.functions.invoke('streamlabs-polls', {
        body: {
          action: 'end_poll',
          pollData: { pollId: poll.id }
        }
      });

      if (streamlabsError) throw streamlabsError;

      // Update poll status in Supabase
      const { error } = await supabase
        .from('polls')
        .update({ status: 'completed' })
        .eq('id', poll.id);

      if (error) throw error;

      toast({
        title: "Poll archived successfully",
      });
    } catch (error) {
      console.error('Error archiving poll:', error);
      toast({
        title: "Failed to archive poll",
        variant: "destructive",
      });
    } finally {
      setIsArchiving(false);
    }
  };

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
      
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>{totalVotes} total votes</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={archivePoll}
          disabled={isArchiving}
          className="h-8 w-8 hover:text-neon-red"
        >
          <Archive className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ActivePoll;