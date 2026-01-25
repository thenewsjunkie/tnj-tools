
import React from "react";

interface StrawpollEmbedProps {
  embedUrl: string;
}

const StrawpollEmbed: React.FC<StrawpollEmbedProps> = ({ embedUrl }) => {
  return (
    <div className="w-full">
      <iframe 
        src={embedUrl}
        className="w-full"
        style={{ border: 'none', minHeight: '400px' }}
        allowFullScreen
        title="Strawpoll Embed"
      />
    </div>
  );
};

export default StrawpollEmbed;
