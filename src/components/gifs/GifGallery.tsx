
import { useState, useEffect } from "react";
import { getApprovedGifs, getGifStillUrl, getGifAnimatedUrl } from "@/utils/gifUtils";
import { useToast } from "@/components/ui/use-toast";

interface GifItem {
  id: string;
  title: string;
  gif_url: string;
  created_at: string;
}

export default function GifGallery() {
  const [gifs, setGifs] = useState<GifItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeGif, setActiveGif] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchGifs = async () => {
      try {
        const data = await getApprovedGifs();
        setGifs(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load GIFs",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchGifs();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-pulse text-center">
          <p className="text-lg">Loading GIFs...</p>
        </div>
      </div>
    );
  }

  if (gifs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg">No GIFs available yet.</p>
        <p className="text-muted-foreground">Be the first to upload one!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {gifs.map((gif) => (
        <div 
          key={gif.id}
          className="bg-card border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          onMouseEnter={() => setActiveGif(gif.id)}
          onMouseLeave={() => setActiveGif(null)}
        >
          <div className="relative aspect-square bg-muted">
            <img 
              src={activeGif === gif.id ? getGifAnimatedUrl(gif.gif_url) : getGifStillUrl(gif.gif_url)} 
              alt={gif.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-3">
            <h3 className="font-medium truncate">{gif.title}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}
