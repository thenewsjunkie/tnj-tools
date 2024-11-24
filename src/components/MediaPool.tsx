import { useState } from "react";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MediaGrid } from "./media/MediaGrid";
import { MediaInput } from "./media/MediaInput";
import type { MediaItem } from "./media/types";

const MediaPool = () => {
  const [newUrl, setNewUrl] = useState("");
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
      
      return data.map(item => ({
        ...item,
        type: item.type as 'youtube' | 'twitter',
        id: item.id
      })) as MediaItem[];
    },
  });

  const addMediaMutation = useMutation({
    mutationFn: async (newItem: Omit<MediaItem, 'id' | 'created_at'>) => {
      const { data: insertedData, error: insertError } = await supabase
        .from('media_pool')
        .insert({
          url: newItem.url,
          thumbnail: newItem.thumbnail,
          type: newItem.type,
          title: newItem.title
        })
        .select('*')
        .single();
      
      if (insertError) throw insertError;
      return insertedData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-pool'] });
      setNewUrl("");
      toast({
        title: "Success",
        description: "Media added successfully",
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
      const { error: deleteError } = await supabase
        .from('media_pool')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-pool'] });
      toast({
        title: "Success",
        description: "Media removed successfully",
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
        onPlay={() => {}}
        onDelete={deleteMediaMutation.mutate}
      />
    </div>
  );
};

export default MediaPool;