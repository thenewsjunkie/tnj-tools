
import React from "react";

interface StrawpollEmbedProps {
  embedUrl: string;
}

const StrawpollEmbed: React.FC<StrawpollEmbedProps> = ({ embedUrl }) => {
  return (
    <div className="w-full h-full min-h-[480px] flex items-center justify-center">
      <iframe 
        src={embedUrl}
        className="w-full h-full min-h-[480px]"
        style={{ border: 'none' }}
        allowFullScreen
        title="Strawpoll Embed"
      />
    </div>
  );
};

export default StrawpollEmbed;
