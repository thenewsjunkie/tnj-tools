
import React, { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GifGalleryProps {
  gifs: Tables<"tnj_gifs">[];
}

const GifGallery: React.FC<GifGalleryProps> = ({ gifs }) => {
  const [hoveredGifId, setHoveredGifId] = useState<string | null>(null);

  const handleDownload = async (url: string, title: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${title}.gif`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading GIF:', error);
    }
  };

  if (gifs.length === 0) {
    return (
      <div className="text-center p-12 border border-dashed rounded-lg">
        <p className="text-muted-foreground">No GIFs available yet. Be the first to upload!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {gifs.map((gif) => (
        <Card
          key={gif.id}
          className="overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg"
          onMouseEnter={() => setHoveredGifId(gif.id)}
          onMouseLeave={() => setHoveredGifId(null)}
        >
          <div className="aspect-square relative overflow-hidden">
            {hoveredGifId === gif.id ? (
              // Show animated GIF when hovered
              <img
                src={gif.gif_url}
                alt={gif.title}
                className="object-cover w-full h-full"
              />
            ) : (
              // Show first frame when not hovered by setting specific Firefox/Chrome styling
              <img
                src={gif.gif_url}
                alt={gif.title}
                className="object-cover w-full h-full"
                style={{
                  WebkitAnimationPlayState: "paused",
                  animationPlayState: "paused",
                  WebkitAnimationDelay: "-999s",
                  animationDelay: "-999s"
                }}
              />
            )}
          </div>
          <div className="p-3 flex items-center justify-between">
            <h3 className="font-medium text-sm truncate mr-2">{gif.title}</h3>
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(gif.gif_url, gif.title);
              }}
            >
              <Download className="h-4 w-4" />
              <span className="sr-only">Download GIF</span>
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default GifGallery;
