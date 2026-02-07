import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SSToolsSettings {
  id: string;
  day_of_week: number;
  time_of_day: string;
  timezone: string;
  stream_url: string;
  updated_at: string;
}

export const useSSToolsSettings = () => {
  return useQuery({
    queryKey: ["ss-tools-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ss_tools_settings" as any)
        .select("*")
        .limit(1)
        .single();
      if (error) throw error;
      return data as unknown as SSToolsSettings;
    },
  });
};

export const useUpdateSSToolsSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Partial<SSToolsSettings> & { id: string }) => {
      const { id, ...updates } = settings;
      const { error } = await supabase
        .from("ss_tools_settings" as any)
        .update({ ...updates, updated_at: new Date().toISOString() } as any)
        .eq("id", id as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ss-tools-settings"] });
    },
  });
};
