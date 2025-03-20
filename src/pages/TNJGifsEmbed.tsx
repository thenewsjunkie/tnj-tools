
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Tables } from "@/integrations/supabase/types";
import GifUploadForm from "@/components/tnj-gifs/GifUploadForm";
import GifGallery from "@/components/tnj-gifs/GifGallery";

const TNJGifsEmbed = () => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  // Fetch approved gifs
  const { data: gifs = [], refetch } = useQuery({
    queryKey: ["tnj-gifs-embed"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tnj_gifs")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error fetching GIFs",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      return data as Tables<"tnj_gifs">[];
    },
  });

  const handleUploadSuccess = () => {
    toast({
      title: "GIF uploaded successfully",
      description: "Your GIF has been submitted for approval.",
    });
    refetch();
  };

  return (
    <div className="p-4 bg-white">
      <div className="mb-8 bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Upload a GIF</h2>
        <GifUploadForm 
          onUploadStart={() => setIsUploading(true)}
          onUploadComplete={() => {
            setIsUploading(false);
            handleUploadSuccess();
          }}
          onUploadError={(error) => {
            setIsUploading(false);
            toast({
              title: "Upload failed",
              description: error,
              variant: "destructive",
            });
          }}
        />
        {isUploading && (
          <p className="text-sm text-gray-500 mt-2">
            Uploading GIF... Please wait.
          </p>
        )}
      </div>
      
      <GifGallery gifs={gifs} />
    </div>
  );
};

export default TNJGifsEmbed;
