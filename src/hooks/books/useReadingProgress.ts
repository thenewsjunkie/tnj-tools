import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCallback, useRef } from "react";

export function useSaveProgress(bookId: string | undefined) {
  const qc = useQueryClient();
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const mutation = useMutation({
    mutationFn: async ({
      location,
      percentage,
    }: {
      location: string;
      percentage: number;
    }) => {
      if (!bookId) return;
      const { error } = await supabase
        .from("reading_progress")
        .upsert(
          {
            book_id: bookId,
            location,
            percentage,
            last_read_at: new Date().toISOString(),
          },
          { onConflict: "book_id" }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["book", bookId] });
      qc.invalidateQueries({ queryKey: ["books"] });
    },
  });

  const debouncedSave = useCallback(
    (location: string, percentage: number) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        mutation.mutate({ location, percentage });
      }, 2000);
    },
    [mutation]
  );

  return { saveProgress: debouncedSave, isSaving: mutation.isPending };
}
