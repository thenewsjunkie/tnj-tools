import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ShowSong {
  id: string;
  title: string;
  artist: string | null;
  audio_url: string;
  cover_url: string | null;
  duration: number | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const QUERY_KEY = ["show_songs"];

export const useShowSongs = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<ShowSong[]> => {
      const { data, error } = await supabase
        .from("show_songs" as any)
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data as any) ?? [];
    },
  });

  const addSong = useMutation({
    mutationFn: async (song: { title: string; artist?: string; audio_url: string; cover_url?: string; duration?: number }) => {
      const { error } = await supabase.from("show_songs" as any).insert(song as any);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const deleteSong = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("show_songs" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  return { songs: query.data ?? [], isLoading: query.isLoading, addSong, deleteSong };
};
