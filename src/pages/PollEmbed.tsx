
import React from "react";
import { useParams } from "react-router-dom";
import PollEmbed from "@/components/polls/PollEmbed";

const PollEmbedPage = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Poll ID is required</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <PollEmbed pollId={id} />
      </div>
    </div>
  );
};

export default PollEmbedPage;
