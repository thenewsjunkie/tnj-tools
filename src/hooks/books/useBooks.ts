import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Book {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  cover_url: string | null;
  language: string;
  tags: string[];
  file_type: string;
  file_url: string;
  file_size: number | null;
  checksum: string | null;
  created_at: string;
  updated_at: string;
  reading_progress?: {
    percentage: number;
    last_read_at: string;
    location: string | null;
  } | null;
}

export function useBooks(search?: string, sort?: string) {
  return useQuery({
    queryKey: ["books", search, sort],
    queryFn: async () => {
      let query = supabase
        .from("books")
        .select("*, reading_progress(percentage, last_read_at, location)");

      if (search) {
        query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%`);
      }

      switch (sort) {
        case "title":
          query = query.order("title");
          break;
        case "author":
          query = query.order("author");
          break;
        case "added":
          query = query.order("created_at", { ascending: false });
          break;
        case "progress":
          query = query.order("created_at", { ascending: false });
          break;
        default: // recently read
          query = query.order("updated_at", { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data as any[]).map((b) => ({
        ...b,
        reading_progress: b.reading_progress?.[0] ?? null,
      })) as Book[];
    },
  });
}

export function useBook(id: string | undefined) {
  return useQuery({
    queryKey: ["book", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*, reading_progress(percentage, last_read_at, location)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return {
        ...data,
        reading_progress: (data as any).reading_progress?.[0] ?? null,
      } as Book;
    },
  });
}

export function useCreateBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (book: {
      title: string;
      author?: string;
      description?: string;
      cover_url?: string;
      language?: string;
      tags?: string[];
      file_type: string;
      file_url: string;
      file_size?: number;
      checksum?: string;
    }) => {
      const { data, error } = await supabase
        .from("books")
        .insert(book)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["books"] }),
  });
}

export function useDeleteBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("books").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["books"] }),
  });
}
