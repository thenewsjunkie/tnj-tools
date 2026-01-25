
import React, { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PollEmbed from "@/components/polls/PollEmbed";
import StrawpollEmbed from "@/components/polls/StrawpollEmbed";

const PollEmbedPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const theme = searchParams.get("theme") === "dark" ? "dark" : "light";

  // Check if this is the "latest" poll route
  const isLatestPoll = id === 'latest';

  // Fetch latest poll with Strawpoll data for direct rendering
  const { data: latestPollData, isLoading } = useQuery({
    queryKey: ["latest-poll-embed"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("polls")
        .select("id, strawpoll_embed_url")
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
    enabled: isLatestPoll,
  });

  // Enable CORS for embedding via iframe
  useEffect(() => {
    // Send message to parent window when poll loads
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'POLL_LOADED', pollId: id }, '*');
    }
  }, [id]);

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Poll ID is required</p>
      </div>
    );
  }

  // For latest poll route with Strawpoll, render full-page Strawpoll embed
  if (isLatestPoll && latestPollData?.strawpoll_embed_url) {
    return (
      <div className="min-h-screen w-full">
        <StrawpollEmbed embedUrl={latestPollData.strawpoll_embed_url} />
      </div>
    );
  }

  // Loading state for latest poll
  if (isLatestPoll && isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'light' ? 'bg-white' : 'bg-background'}`}>
        <p className="text-muted-foreground">Loading poll...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-2 flex items-center justify-center ${theme === 'light' ? 'bg-white' : 'bg-background'}`}>
      <div className="w-full">
        {isLatestPoll ? (
          <PollEmbed showLatest={true} theme={theme} />
        ) : (
          <PollEmbed pollId={id} theme={theme} />
        )}
      </div>
    </div>
  );
};

export default PollEmbedPage;
