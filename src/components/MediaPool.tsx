import { useState, useEffect } from "react";
import { X, Play, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface MediaItem {
  id: string;
  url: string;
  thumbnail: string;
  type: 'youtube' | 'twitter';
  title: string;
}

const MediaPool = () => {
  const [newUrl, setNewUrl] = useState("");
  const [fullscreenMedia, setFullscreenMedia] = useState<MediaItem | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: mediaItems = [], isLoading } = useQuery({
    queryKey: ['media-pool'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_pool')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const addMediaMutation = useMutation({
    mutationFn: async (newItem: Omit<MediaItem, 'id'>) => {
      const { error } = await supabase
        .from('media_pool')
        .insert([newItem]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-pool'] });
      setNewUrl("");
      toast({
        title: "Media added",
        description: "Your media has been added to the pool",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add media",
        variant: "destructive",
      });
    },
  });

  const deleteMediaMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('media_pool')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-pool'] });
      toast({
        title: "Media removed",
        description: "The media has been removed from your pool",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete media",
        variant: "destructive",
      });
    },
  });

  const getYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getTwitterVideoId = (url: string) => {
    const regex = /(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)/;
    const match = url.match(regex);
    return match ? { id: match[2], handle: match[1] } : null;
  };

  const handleAddMedia = async () => {
    try {
      let type: 'youtube' | 'twitter';
      let thumbnail: string;
      let id: string;
      let title: string;

      if (newUrl.includes('youtube.com') || newUrl.includes('youtu.be')) {
        const videoId = getYouTubeVideoId(newUrl);
        if (!videoId) throw new Error("Invalid YouTube URL");
        type = 'youtube';
        thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        id = videoId;
        title = 'YouTube Video';
      } else if (newUrl.includes('twitter.com') || newUrl.includes('x.com')) {
        const tweetData = getTwitterVideoId(newUrl);
        if (!tweetData) throw new Error("Invalid Twitter URL");
        type = 'twitter';
        thumbnail = 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80';
        id = tweetData.id;
        title = `@${tweetData.handle}'s Tweet`;
      } else {
        throw new Error("Please enter a valid YouTube or Twitter video URL");
      }

      await addMediaMutation.mutateAsync({
        url: newUrl,
        thumbnail,
        type,
        title
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add media",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full md:col-span-2 space-y-4">
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold">Media Pool</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Paste YouTube or Twitter video URL"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleAddMedia}>Add Media</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mediaItems.map((item) => (
          <div key={item.id} className="relative group">
            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2">
                <p className="text-white text-sm truncate">{item.title}</p>
              </div>
              <button
                onClick={() => setFullscreenMedia(item)}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Play className="w-12 h-12 text-white" />
              </button>
              <button
                onClick={() => deleteMediaMutation.mutate(item.id)}
                className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {fullscreenMedia && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button
            onClick={() => setFullscreenMedia(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="w-full h-full max-w-7xl max-h-screen p-4">
            {fullscreenMedia.type === 'youtube' ? (
              <iframe
                src={`https://www.youtube.com/embed/${fullscreenMedia.id}?autoplay=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <iframe
                src={`https://platform.twitter.com/embed/Tweet.html?id=${fullscreenMedia.id}`}
                className="w-full h-full"
                allowFullScreen
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaPool;