
import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { usePollData } from "./hooks/usePollData";
import PollVotingState from "./PollVotingState";
import PollResultsView from "./PollResultsView";
import { PollEmbedProps } from "./types";

const PollEmbed: React.FC<PollEmbedProps> = ({ 
  pollId,
  showLatest = false,
  theme = "light" // Default to light theme
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  
  const {
    pollIdToFetch,
    poll,
    totalVotes,
    isPollLoading,
    isLoadingLatest,
    refetchPoll,
    refetchTotalVotes
  } = usePollData(pollId || null, showLatest);
  
  const storageKey = `poll_voted_${pollIdToFetch}`;

  useEffect(() => {
    if (pollIdToFetch) {
      const voted = localStorage.getItem(storageKey) === 'true';
      setHasVoted(voted);
    }
  }, [pollIdToFetch, storageKey]);

  const handleVote = async () => {
    if (!selectedOption || !pollIdToFetch) return;

    try {
      const { error } = await supabase.rpc('increment_poll_option_votes', {
        option_id: selectedOption
      });

      if (error) throw error;

      localStorage.setItem(storageKey, 'true');
      setHasVoted(true);
      
      await refetchPoll();
      await refetchTotalVotes();
      
      queryClient.invalidateQueries({ queryKey: ["poll", pollIdToFetch] });
      queryClient.invalidateQueries({ queryKey: ["poll-total-votes", pollIdToFetch] });
      
      toast({
        title: "Thanks for voting!",
        description: "Your vote has been recorded.",
      });
    } catch (error) {
      console.error("Error voting:", error);
      toast({
        title: "Error",
        description: "There was a problem recording your vote. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Define styling based on theme
  const cardClassName = cn(
    "w-full bg-white border border-gray-200 shadow-sm",
    theme === "light" ? "bg-white border-gray-200" : "bg-background",
    "px-4 md:px-8"
  );
  
  const primaryColor = theme === "light" ? "bg-neon-red" : "bg-primary";
  const mutedBgColor = theme === "light" ? "bg-gray-100" : "bg-muted";
  const textColor = theme === "light" ? "text-gray-800" : "text-card-foreground";
  const mutedTextColor = theme === "light" ? "text-gray-500" : "text-muted-foreground";

  // Loading state
  if ((isPollLoading && !!pollIdToFetch) || (isLoadingLatest && !pollIdToFetch)) {
    return (
      <Card className={cardClassName}>
        <CardContent className="pt-6">
          <div className="flex justify-center p-4">
            <p className={mutedTextColor}>Loading poll...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No poll found state
  if (!poll) {
    return (
      <Card className={cardClassName}>
        <CardContent className="pt-6">
          <div className="text-center p-4">
            <p className={mutedTextColor}>No active poll found.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cardClassName}>
      <CardHeader>
        <CardTitle className={`text-xl ${textColor}`}>{poll.question}</CardTitle>
      </CardHeader>
      
      {!hasVoted ? (
        <PollVotingState 
          options={poll.poll_options}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          handleVote={handleVote}
          theme={theme}
          textColor={textColor}
        />
      ) : (
        <PollResultsView 
          options={poll.poll_options}
          totalVotes={totalVotes || 0}
          primaryColor={primaryColor}
          mutedBgColor={mutedBgColor}
          textColor={textColor}
          mutedTextColor={mutedTextColor}
        />
      )}
    </Card>
  );
};

export default PollEmbed;
