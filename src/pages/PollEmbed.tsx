
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import PollEmbed from "@/components/polls/PollEmbed";

const PollEmbedPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const theme = searchParams.get("theme") === "dark" ? "dark" : "light";

  // Enable CORS for embedding via iframe
  useEffect(() => {
    // Send message to parent window when poll loads
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'POLL_LOADED', pollId: id }, '*');
    }
  }, [id]);

  // Check if this is the "latest" poll route
  const isLatestPoll = id === 'latest';

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Poll ID is required</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 flex items-center justify-center ${theme === 'light' ? 'bg-white' : 'bg-background'}`}>
      <div className="w-full max-w-md">
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
