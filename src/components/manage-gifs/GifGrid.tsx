
import React from "react";
import { Tables } from "@/integrations/supabase/types";
import GifCard from "./GifCard";

interface GifGridProps {
  gifs: Tables<"tnj_gifs">[];
  onPreview: (gif: Tables<"tnj_gifs">) => void;
  onEdit: (gif: Tables<"tnj_gifs">) => void;
  onDelete: (gif: Tables<"tnj_gifs">) => void;
  onStatusChange: (id: string, status: string) => void;
  getBadgeVariant: (status: string) => string;
}

const GifGrid: React.FC<GifGridProps> = ({
  gifs,
  onPreview,
  onEdit,
  onDelete,
  onStatusChange,
  getBadgeVariant
}) => {
  if (gifs.length === 0) {
    return (
      <div className="text-center p-12 border border-dashed rounded-lg">
        <p className="text-muted-foreground">No GIFs have been uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {gifs.map((gif) => (
        <GifCard
          key={gif.id}
          gif={gif}
          onPreview={onPreview}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          getBadgeVariant={getBadgeVariant}
        />
      ))}
    </div>
  );
};

export default GifGrid;
