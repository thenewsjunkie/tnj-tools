import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface AddToHopperParams {
  url: string;
  title?: string;
  thumbnailUrl?: string;
  date?: Date;
}

export const useAddToHopper = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ url, title, thumbnailUrl, date }: AddToHopperParams) => {
      const dateKey = format(date || new Date(), "yyyy-MM-dd");

      // Get current max order
      const { data: existingItems } = await supabase
        .from("hopper_items")
        .select("display_order")
        .eq("date", dateKey)
        .order("display_order", { ascending: false })
        .limit(1);

      const maxOrder = existingItems?.[0]?.display_order ?? -1;

      const { error } = await supabase.from("hopper_items").insert({
        date: dateKey,
        url,
        title: title || null,
        thumbnail_url: thumbnailUrl || null,
        display_order: maxOrder + 1,
      });

      if (error) throw error;
      return dateKey;
    },
    onSuccess: (dateKey) => {
      queryClient.invalidateQueries({ queryKey: ["hopper-items", dateKey] });
      toast({ title: "Added to Hopper" });
    },
    onError: () => {
      toast({ title: "Failed to add to Hopper", variant: "destructive" });
    },
  });

  return mutation;
};