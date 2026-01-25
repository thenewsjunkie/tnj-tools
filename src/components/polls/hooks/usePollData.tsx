
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Poll, RawPoll } from "../types";

export function usePollData(pollId: string | null, showLatest: boolean) {
  const [pollIdToFetch, setPollIdToFetch] = useState<string | null>(pollId || null);
  
  // Fetch the latest poll if requested
  const { data: latestPoll, isLoading: isLoadingLatest } = useQuery({
    queryKey: ["latest-poll"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("polls")
        .select("id, strawpoll_id, strawpoll_url, strawpoll_embed_url")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching latest poll:", error);
        return null;
      }
      
      return data;
    },
    enabled: showLatest || !pollId,
  });

  // Update pollIdToFetch when latestPoll changes
  useEffect(() => {
    if (showLatest && latestPoll?.id) {
      setPollIdToFetch(latestPoll.id);
    }
  }, [latestPoll, showLatest]);

  // Fetch the poll data
  const { data: poll, isLoading: isPollLoading, refetch: refetchPoll } = useQuery({
    queryKey: ["poll", pollIdToFetch],
    queryFn: async () => {
      if (!pollIdToFetch) return null;
      
      const { data, error } = await supabase
        .from("polls")
        .select("*, poll_options(id, text, votes)")
        .eq("id", pollIdToFetch)
        .maybeSingle();

      if (error) {
        console.error("Error fetching poll:", error);
        return null;
      }
      
      if (!data) return null;
      
      // Transform the raw data to include display_order
      const rawPoll = data as RawPoll;
      
      if (rawPoll && rawPoll.poll_options) {
        // Create a new Poll object with properly structured poll_options that include display_order
        const transformedPoll: Poll = {
          ...rawPoll,
          strawpoll_id: rawPoll.strawpoll_id,
          strawpoll_url: rawPoll.strawpoll_url,
          strawpoll_embed_url: rawPoll.strawpoll_embed_url,
          poll_options: rawPoll.poll_options.map((option, index) => ({
            ...option,
            display_order: index
          }))
        };
        
        return transformedPoll;
      }
      
      return null;
    },
    enabled: !!pollIdToFetch,
  });

  // Fetch total votes
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

  return {
    pollIdToFetch,
    setPollIdToFetch,
    poll,
    totalVotes,
    isPollLoading,
    isLoadingLatest,
    isTotalVotesLoading,
    refetchPoll,
    refetchTotalVotes,
  };
}
