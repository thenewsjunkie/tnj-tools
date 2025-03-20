
import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Tables } from "@/integrations/supabase/types";
import GifUploadForm from "@/components/tnj-gifs/GifUploadForm";
import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const TNJGifsEmbed = () => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredGifId, setHoveredGifId] = useState<string | null>(null);

  // Function to send height to parent window
  const updateHeight = () => {
    if (containerRef.current) {
      const height = containerRef.current.scrollHeight;
      window.parent.postMessage({ type: 'resize', height }, '*');
    }
  };

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

  // Update height whenever content changes
  useEffect(() => {
    updateHeight();
    
    // Add resize event listener to handle window resize
    window.addEventListener('resize', updateHeight);
    
    // Set up a MutationObserver to detect DOM changes
    const observer = new MutationObserver(updateHeight);
    
    if (containerRef.current) {
      observer.observe(containerRef.current, { 
        childList: true, 
        subtree: true,
        attributes: true
      });
    }
    
    // Clean up
    return () => {
      window.removeEventListener('resize', updateHeight);
      observer.disconnect();
    };
  }, [gifs, isUploading]);

  return (
    <div className="p-4 bg-white" ref={containerRef}>
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
      
      {/* Custom GIF Gallery with hover-based play */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {gifs.length === 0 ? (
          <div className="text-center p-12 border border-dashed rounded-lg col-span-full">
            <p className="text-muted-foreground">No GIFs available yet. Be the first to upload!</p>
          </div>
        ) : (
          gifs.map((gif) => (
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
          ))
        )}
      </div>
    </div>
  );
};

export default TNJGifsEmbed;
