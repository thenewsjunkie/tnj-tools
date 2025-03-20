
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import GifGallery from "@/components/tnj-gifs/GifGallery";

const TNJGifsEmbed = () => {
  // Fetch approved gifs
  const { data: gifs = [] } = useQuery({
    queryKey: ["tnj-gifs-embed"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tnj_gifs")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Tables<"tnj_gifs">[];
    },
  });

  return (
    <div className="p-4 bg-white">
      <GifGallery gifs={gifs} />
    </div>
  );
};

export default TNJGifsEmbed;
