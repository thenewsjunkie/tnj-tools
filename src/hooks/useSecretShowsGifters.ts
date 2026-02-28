import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SecretShowsGifter {
  id: string;
  username: string;
  total_gifts: number;
  monthly_gifts: Record<string, number>;
  last_gift_date: string | null;
  created_at: string;
  updated_at: string;
}

export const useSecretShowsGifters = (limit = 20) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("secret-shows-gifters-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "secret_shows_gifters" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["secret-shows-gifters"] });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return useQuery({
    queryKey: ["secret-shows-gifters", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("secret_shows_gifters" as any)
        .select("*")
        .order("total_gifts", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data as unknown as SecretShowsGifter[]) || [];
    },
  });
};

export const useAddSecretShowsGifter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ username, giftCount }: { username: string; giftCount: number }) => {
      const monthKey = new Date().toISOString().slice(0, 7);
      
      // Check if user exists
      const { data: existing } = await supabase
        .from("secret_shows_gifters" as any)
        .select("*")
        .eq("username", username)
        .maybeSingle();

      if (existing) {
        const gifter = existing as unknown as SecretShowsGifter;
        const monthlyGifts = { ...gifter.monthly_gifts };
        monthlyGifts[monthKey] = Math.max(0, (monthlyGifts[monthKey] || 0) + giftCount);
        
        const { error } = await supabase
          .from("secret_shows_gifters" as any)
          .update({
            total_gifts: Math.max(0, gifter.total_gifts + giftCount),
            monthly_gifts: monthlyGifts,
            last_gift_date: new Date().toISOString(),
          } as any)
          .eq("id", gifter.id);
        if (error) throw error;
      } else {
        if (giftCount <= 0) throw new Error("Cannot subtract from a user that doesn't exist");
        const { error } = await supabase
          .from("secret_shows_gifters" as any)
          .insert({
            username,
            total_gifts: giftCount,
            monthly_gifts: { [monthKey]: giftCount },
            last_gift_date: new Date().toISOString(),
          } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["secret-shows-gifters"] });
    },
  });
};

export const useAllSecretShowsGifterNames = () => {
  return useQuery({
    queryKey: ["secret-shows-gifters", "all-names"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("secret_shows_gifters" as any)
        .select("username, total_gifts")
        .order("total_gifts", { ascending: false });
      if (error) throw error;
      return (data as unknown as { username: string; total_gifts: number }[]) || [];
    },
  });
};

export const useDeleteSecretShowsGifter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("secret_shows_gifters" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["secret-shows-gifters"] });
    },
  });
};
