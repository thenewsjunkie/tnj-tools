import { useState } from "react";
import { X, Play, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MediaDisplay } from "./media/MediaDisplay";
import { MediaGrid } from "./media/MediaGrid";
import { MediaInput } from "./media/MediaInput";
import type { MediaItem } from "./media/types";

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
      
      // Ensure the type is correctly converted from the database
      return data.map(item => ({
        ...item,
        type: item.type as 'youtube' | 'twitter'
      }));
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full md:col-span-2 space-y-4">
      <MediaInput 
        newUrl={newUrl}
        setNewUrl={setNewUrl}
        onAdd={addMediaMutation.mutate}
      />
      <MediaGrid 
        items={mediaItems}
        onPlay={setFullscreenMedia}
        onDelete={deleteMediaMutation.mutate}
      />
      {fullscreenMedia && (
        <MediaDisplay
          media={fullscreenMedia}
          onClose={() => setFullscreenMedia(null)}
        />
      )}
    </div>
  );
};

export default MediaPool;