import React from "react";

interface VideoNoteProps {
  url: string;
  title: string;
}

const VideoNote = ({ url, title }: VideoNoteProps) => {
  return (
    <div className="relative aspect-video">
      <iframe
        src={url}
        title={title || 'Show note video'}
        className="rounded-md w-full h-full"
        allowFullScreen
      />
    </div>
  );
};

export default VideoNote;