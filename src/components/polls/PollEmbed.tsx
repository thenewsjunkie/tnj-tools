
import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";

interface PollEmbedProps {
  pollId?: string;
  showLatest?: boolean;
  theme?: "light" | "dark";
}

const PollEmbed: React.FC<PollEmbedProps> = ({ 
  pollId,
  showLatest = false,
  theme = "light" // Default to light theme
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [pollIdToFetch, setPollIdToFetch] = useState<string | null>(pollId || null);
  
  // Store vote in localStorage to prevent multiple votes
  const storageKey = `poll_voted_${pollIdToFetch}`;

  // Fetch latest poll if no pollId provided or showLatest is true
  const { data: latestPoll, isLoading: isLoadingLatest } = useQuery({
    queryKey: ["latest-poll"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("polls")
        .select("id")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching latest poll:", error);
        return null;
      }
      
      return data;
    },
    enabled: showLatest || !pollId,
  });

  // Update pollIdToFetch when latestPoll is loaded
  useEffect(() => {
    if (showLatest && latestPoll?.id) {
      setPollIdToFetch(latestPoll.id);
    }
  }, [latestPoll, showLatest]);

  // Check if user has already voted
  useEffect(() => {
    if (pollIdToFetch) {
      const voted = localStorage.getItem(storageKey) === 'true';
      setHasVoted(voted);
    }
  }, [pollIdToFetch, storageKey]);

  // Fetch the poll data
  const { data: poll, isLoading: isPollLoading, refetch: refetchPoll } = useQuery({
    queryKey: ["poll", pollIdToFetch],
    queryFn: async () => {
      if (!pollIdToFetch) return null;
      
      const { data, error } = await supabase
        .from("polls")
        .select("*, poll_options(*)")
        .eq("id", pollIdToFetch)
        .single();

      if (error) {
        console.error("Error fetching poll:", error);
        return null;
      }
      
      return data;
    },
    enabled: !!pollIdToFetch,
  });
  
  const { data: totalVotes, isLoading: isTotalVotesLoading, refetch: refetchTotalVotes } = useQuery({
    queryKey: ["poll-total-votes", pollIdToFetch],
    queryFn: async () => {
      if (!pollIdToFetch) return 0;
      
      const { data, error } = await supabase
        .from("poll_options")
        .select("votes")
        .eq("poll_id", pollIdToFetch);

      if (error) {
        console.error("Error fetching poll votes:", error);
        return 0;
      }
      
      return data.reduce((sum, option) => sum + (option.votes || 0), 0);
    },
    enabled: !!pollIdToFetch,
  });

  const handleVote = async () => {
    if (!selectedOption || !pollIdToFetch) return;

    try {
      const { error } = await supabase.rpc('increment_poll_option_votes', {
        option_id: selectedOption
      });

      if (error) throw error;

      // Mark as voted in localStorage
      localStorage.setItem(storageKey, 'true');
      setHasVoted(true);
      
      // Refetch poll data to update the UI with the new vote
      await refetchPoll();
      await refetchTotalVotes();
      
      // Also invalidate the queries to ensure fresh data
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

  // Determine theme-based styles
  const cardClassName = theme === "light" 
    ? "w-full max-w-md mx-auto bg-white border border-gray-200 shadow-sm" 
    : "w-full max-w-md mx-auto";
  
  const primaryColor = theme === "light" ? "bg-neon-red" : "bg-primary";
  const mutedBgColor = theme === "light" ? "bg-gray-100" : "bg-muted";
  const textColor = theme === "light" ? "text-gray-800" : "text-card-foreground";
  const mutedTextColor = theme === "light" ? "text-gray-500" : "text-muted-foreground";

  // Show loading state
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

  // No poll found
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
      <CardContent>
        {!hasVoted ? (
          <RadioGroup value={selectedOption || undefined} onValueChange={setSelectedOption}>
            {poll.poll_options.map((option: any) => (
              <div className="flex items-center space-x-2 mb-3" key={option.id}>
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className={`cursor-pointer ${textColor}`}>{option.text}</Label>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <div className="space-y-3">
            {poll.poll_options.map((option: any) => {
              const percentage = totalVotes ? Math.round((option.votes / totalVotes) * 100) : 0;
              
              return (
                <div key={option.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className={textColor}>{option.text}</span>
                    <span className={`font-medium ${textColor}`}>{percentage}%</span>
                  </div>
                  <Progress 
                    value={percentage} 
                    className={mutedBgColor}
                    indicatorClassName={primaryColor}
                  />
                  <p className={`text-xs ${mutedTextColor}`}>{option.votes} votes</p>
                </div>
              );
            })}
            <p className={`text-sm ${mutedTextColor} pt-2`}>
              Total votes: {totalVotes}
            </p>
          </div>
        )}
      </CardContent>
      {!hasVoted && (
        <CardFooter>
          <Button 
            onClick={handleVote} 
            disabled={!selectedOption}
            className="w-full"
            variant={theme === "light" ? "default" : "default"}
          >
            Vote
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default PollEmbed;
