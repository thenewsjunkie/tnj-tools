import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BookBookmark {
  id: string;
  book_id: string;
  location: string;
  label: string | null;
  created_at: string;
}

export function useBookmarks(bookId: string | undefined) {
  return useQuery({
    queryKey: ["book_bookmarks", bookId],
    enabled: !!bookId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("book_bookmarks")
        .select("*")
        .eq("book_id", bookId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BookBookmark[];
    },
  });
}

export function useAddBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bm: { book_id: string; location: string; label?: string }) => {
      const { data, error } = await supabase
        .from("book_bookmarks")
        .insert(bm)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["book_bookmarks", v.book_id] }),
  });
}

export function useDeleteBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, bookId }: { id: string; bookId: string }) => {
      const { error } = await supabase.from("book_bookmarks").delete().eq("id", id);
      if (error) throw error;
      return bookId;
    },
    onSuccess: (bookId) => qc.invalidateQueries({ queryKey: ["book_bookmarks", bookId] }),
  });
}
