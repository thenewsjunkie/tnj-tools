
import React, { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";

interface GifGalleryProps {
  gifs: Tables<"tnj_gifs">[];
}

const GifGallery: React.FC<GifGalleryProps> = ({ gifs }) => {
  const [hoveredGifId, setHoveredGifId] = useState<string | null>(null);

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
            <img
              src={gif.gif_url}
              alt={gif.title}
              className="object-cover w-full h-full"
              // Only animate when hovered
              style={{
                animationPlayState: hoveredGifId === gif.id ? "running" : "paused",
              }}
            />
          </div>
          <div className="p-3">
            <h3 className="font-medium text-sm truncate">{gif.title}</h3>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default GifGallery;
