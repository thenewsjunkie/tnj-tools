import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BookNote {
  id: string;
  book_id: string;
  cfi_range: string | null;
  text: string;
  created_at: string;
}

export function useNotes(bookId: string | undefined) {
  return useQuery({
    queryKey: ["book_notes", bookId],
    enabled: !!bookId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("book_notes")
        .select("*")
        .eq("book_id", bookId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BookNote[];
    },
  });
}

export function useAddNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (n: { book_id: string; cfi_range?: string; text: string }) => {
      const { data, error } = await supabase
        .from("book_notes")
        .insert(n)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["book_notes", v.book_id] }),
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, bookId }: { id: string; bookId: string }) => {
      const { error } = await supabase.from("book_notes").delete().eq("id", id);
      if (error) throw error;
      return bookId;
    },
    onSuccess: (bookId) => qc.invalidateQueries({ queryKey: ["book_notes", bookId] }),
  });
}
