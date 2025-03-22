import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

interface PollEmbedProps {
  pollId: string;
}

const PollEmbed: React.FC<PollEmbedProps> = ({ pollId }) => {
  const { toast } = useToast();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [username, setUsername] = useState("");

  // Get poll and options
  const { data: poll, isLoading } = useQuery({
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
            platform: "web" as "twitch" | "youtube" | "web"
          });

        if (voteError) throw voteError;
      }

      return optionId;
    },
    onSuccess: () => {
      toast({
        title: "Vote recorded",
        description: "Thank you for your vote!",
      });
      setHasVoted(true);
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
      <Card className="w-full">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading poll...</p>
        </CardContent>
      </Card>
    );
  }

  if (!poll) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Poll not found</p>
        </CardContent>
      </Card>
    );
  }

  // If poll is not active
  if (poll.status !== "active") {
    return (
      <Card className="w-full">
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{poll.question}</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasVoted ? (
          <>
            <RadioGroup onValueChange={setSelectedOption} value={selectedOption || ""}>
              {poll.poll_options.map((option: any) => (
                <div key={option.id} className="flex items-center space-x-2 py-2">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id}>{option.text}</Label>
                </div>
              ))}
            </RadioGroup>
            <div className="mt-4">
              <Label htmlFor="username">Your Name (Optional)</Label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name"
                className="w-full mt-1 p-2 border rounded"
              />
            </div>
          </>
        ) : (
          <div className="space-y-3">
            {poll.poll_options.map((option: any) => (
              <div key={option.id} className="space-y-1">
                <div className="flex justify-between">
                  <span>{option.text}</span>
                  <span>{getPercentage(option.votes)}%</span>
                </div>
                <Progress value={getPercentage(option.votes)} />
                <p className="text-xs text-muted-foreground">{option.votes} vote(s)</p>
              </div>
            ))}
            <p className="text-sm text-center mt-4">
              Total votes: {totalVotes}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {!hasVoted ? (
          <Button 
            className="w-full" 
            onClick={handleVote}
            disabled={voteMutation.isPending}
          >
            {voteMutation.isPending ? "Submitting..." : "Submit Vote"}
          </Button>
        ) : (
          <p className="text-center w-full text-sm">Thanks for voting!</p>
        )}
      </CardFooter>
    </Card>
  );
};

export default PollEmbed;
