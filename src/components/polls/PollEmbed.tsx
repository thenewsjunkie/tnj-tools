
import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";

interface PollEmbedProps {
  pollId: string;
}

const PollEmbed: React.FC<PollEmbedProps> = ({ pollId }) => {
  const { toast } = useToast();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [username, setUsername] = useState("");
  
  // Check for existing vote in localStorage
  useEffect(() => {
    const storedVote = localStorage.getItem(`poll_vote_${pollId}`);
    if (storedVote) {
      setHasVoted(true);
    }
  }, [pollId]);

  // Get poll and options
  const { data: poll, isLoading, refetch } = useQuery({
    queryKey: ["poll", pollId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("polls")
        .select("*, poll_options(*)")
        .eq("id", pollId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!pollId,
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async (optionId: string) => {
      // Increment the vote count for this option
      const { error: incrementError } = await supabase.rpc(
        "increment_poll_option_votes",
        { option_id: optionId }
      );

      if (incrementError) throw incrementError;

      // Record the vote with username (if provided)
      if (username.trim()) {
        const { error: voteError } = await supabase
          .from("poll_votes")
          .insert({
            poll_id: pollId,
            option_id: optionId,
            username: username.trim(),
            platform: "web"
          });

        if (voteError) throw voteError;
      }

      return optionId;
    },
    onSuccess: (optionId) => {
      // Store vote in localStorage to prevent multiple votes
      localStorage.setItem(`poll_vote_${pollId}`, optionId);
      
      toast({
        title: "Vote recorded",
        description: "Thank you for your vote!",
      });
      setHasVoted(true);
      
      // Refetch poll data to update results
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error recording vote",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card className="w-full shadow-md">
        <CardContent className="pt-6">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!poll) {
    return (
      <Card className="w-full shadow-md">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Poll not found</p>
        </CardContent>
      </Card>
    );
  }

  // If poll is not active
  if (poll.status !== "active") {
    return (
      <Card className="w-full shadow-md">
        <CardHeader>
          <CardTitle>{poll.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            {poll.status === "draft" ? "This poll is not active yet." : "This poll has ended."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalVotes = poll.poll_options.reduce((sum: number, option: any) => sum + option.votes, 0);

  // Calculate percentages for the progress bars
  const getPercentage = (votes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  const handleVote = () => {
    if (!selectedOption) {
      toast({
        title: "Error",
        description: "Please select an option",
        variant: "destructive",
      });
      return;
    }

    voteMutation.mutate(selectedOption);
  };

  return (
    <Card className="w-full shadow-md border-t-4 border-t-primary">
      <CardHeader className="pb-2">
        <CardTitle>{poll.question}</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasVoted ? (
          <>
            <RadioGroup onValueChange={setSelectedOption} value={selectedOption || ""} className="space-y-3 mt-2">
              {poll.poll_options.map((option: any) => (
                <div key={option.id} className="flex items-center space-x-2 py-2 px-3 rounded-md hover:bg-accent">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex-grow cursor-pointer">{option.text}</Label>
                </div>
              ))}
            </RadioGroup>
            <div className="mt-6">
              <Label htmlFor="username" className="text-sm font-medium">Your Name (Optional)</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name"
                className="mt-1"
              />
            </div>
          </>
        ) : (
          <div className="space-y-4 mt-2">
            {poll.poll_options.map((option: any) => {
              const percentage = getPercentage(option.votes);
              return (
                <div key={option.id} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{option.text}</span>
                    <span className="font-bold">{percentage}%</span>
                  </div>
                  <div className="relative pt-1">
                    <Progress value={percentage} className="h-3" />
                  </div>
                  <p className="text-xs text-muted-foreground">{option.votes} vote(s)</p>
                </div>
              );
            })}
            <div className="text-center pt-2 text-sm text-muted-foreground border-t mt-4">
              Total votes: {totalVotes}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        {!hasVoted ? (
          <Button 
            className="w-full" 
            onClick={handleVote}
            disabled={voteMutation.isPending || !selectedOption}
          >
            {voteMutation.isPending ? "Submitting..." : "Submit Vote"}
          </Button>
        ) : (
          <div className="w-full text-center">
            <p className="text-sm text-muted-foreground">Thanks for voting!</p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default PollEmbed;
