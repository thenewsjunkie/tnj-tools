import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BookHighlight {
  id: string;
  book_id: string;
  cfi_range: string;
  color: string;
  text_excerpt: string | null;
  created_at: string;
}

export function useHighlights(bookId: string | undefined) {
  return useQuery({
    queryKey: ["book_highlights", bookId],
    enabled: !!bookId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("book_highlights")
        .select("*")
        .eq("book_id", bookId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BookHighlight[];
    },
  });
}

export function useAddHighlight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (h: {
      book_id: string;
      cfi_range: string;
      color?: string;
      text_excerpt?: string;
    }) => {
      const { data, error } = await supabase
        .from("book_highlights")
        .insert(h)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["book_highlights", v.book_id] }),
  });
}

export function useDeleteHighlight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, bookId }: { id: string; bookId: string }) => {
      const { error } = await supabase.from("book_highlights").delete().eq("id", id);
      if (error) throw error;
      return bookId;
    },
    onSuccess: (bookId) => qc.invalidateQueries({ queryKey: ["book_highlights", bookId] }),
  });
}
