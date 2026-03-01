import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useCallback, useRef } from "react";
import { useOutputConfig, useUpdateOutputConfig, type OutputConfig, type StudioModule } from "./useOutputConfig";
import { useArtModeConfig, useUpdateArtModeConfig } from "./useArtMode";
import { toast } from "sonner";

export interface StudioSchedule {
  id: string;
  label: string | null;
  action_type: string;
  action_payload: Record<string, any>;
  schedule_type: string;
  scheduled_time: string;
  scheduled_date: string | null;
  day_of_week: number | null;
  day_of_month: number | null;
  timezone: string;
  is_active: boolean;
  last_triggered_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ScheduleInsert = Omit<StudioSchedule, "id" | "created_at" | "updated_at" | "last_triggered_at">;

export const ACTION_TYPES = [
  { value: "set_full_screen", label: "Set Full Screen Module" },
  { value: "clear_full_screen", label: "Clear Full Screen" },
  { value: "toggle_art_mode", label: "Art Mode On/Off" },
  { value: "toggle_ads", label: "Ads On/Off" },
  { value: "toggle_teleprompter", label: "TelePrompter On/Off" },
] as const;

export const SCHEDULE_TYPES = [
  { value: "one_time", label: "One-time" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
] as const;

export const DAYS_OF_WEEK = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

export const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "UTC",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export const useSchedules = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["studio-schedules"],
    queryFn: async (): Promise<StudioSchedule[]> => {
      const { data, error } = await supabase
        .from("studio_schedules" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as any) ?? [];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("studio-schedules-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "studio_schedules" },
        () => queryClient.invalidateQueries({ queryKey: ["studio-schedules"] })
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return query;
};

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (schedule: ScheduleInsert) => {
      const { error } = await supabase
        .from("studio_schedules" as any)
        .insert(schedule as any);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["studio-schedules"] }),
  });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<StudioSchedule> & { id: string }) => {
      const { error } = await supabase
        .from("studio_schedules" as any)
        .update(updates as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["studio-schedules"] }),
  });
};

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("studio_schedules" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["studio-schedules"] }),
  });
};

/** Checks every 60s if any active schedule should fire */
export const useScheduleExecutor = () => {
  const { data: schedules } = useSchedules();
  const { data: outputConfig } = useOutputConfig();
  const updateOutput = useUpdateOutputConfig();
  const { data: artConfig } = useArtModeConfig();
  const updateArt = useUpdateArtModeConfig();
  const updateSchedule = useUpdateSchedule();
  const processingRef = useRef(false);

  const executeAction = useCallback(async (schedule: StudioSchedule) => {
    const { action_type, action_payload } = schedule;

    switch (action_type) {
      case "set_full_screen": {
        const module = action_payload.module as StudioModule;
        if (outputConfig) {
          await updateOutput.mutateAsync({ ...outputConfig, fullScreen: module });
        }
        break;
      }
      case "clear_full_screen": {
        if (outputConfig) {
          await updateOutput.mutateAsync({ ...outputConfig, fullScreen: null });
        }
        break;
      }
      case "toggle_art_mode": {
        const enable = action_payload.enable as boolean;
        if (outputConfig) {
          const newConfig = { ...outputConfig };
          if (enable) {
            newConfig.fullScreen = "art-mode" as StudioModule;
          } else if (newConfig.fullScreen === ("art-mode" as StudioModule)) {
            newConfig.fullScreen = null;
          }
          await updateOutput.mutateAsync(newConfig);
        }
        break;
      }
      case "toggle_ads": {
        const enable = action_payload.enable as boolean;
        if (outputConfig) {
          const newConfig = { ...outputConfig };
          if (enable) {
            newConfig.fullScreen = "ads" as StudioModule;
          } else if (newConfig.fullScreen === ("ads" as StudioModule)) {
            newConfig.fullScreen = null;
          }
          await updateOutput.mutateAsync(newConfig);
        }
        break;
      }
      case "toggle_teleprompter": {
        const enable = action_payload.enable as boolean;
        if (outputConfig) {
          const newConfig = { ...outputConfig };
          if (enable) {
            newConfig.fullScreen = "teleprompter" as StudioModule;
          } else if (newConfig.fullScreen === ("teleprompter" as StudioModule)) {
            newConfig.fullScreen = null;
          }
          await updateOutput.mutateAsync(newConfig);
        }
        break;
      }
    }
  }, [outputConfig, updateOutput, updateArt]);

  const checkSchedules = useCallback(async () => {
    if (!schedules || processingRef.current) return;
    processingRef.current = true;

    try {
      const now = new Date();

      for (const schedule of schedules) {
        if (!schedule.is_active) continue;

        // Get "now" in the schedule's timezone
        const tzNow = new Date(now.toLocaleString("en-US", { timeZone: schedule.timezone }));
        const currentHour = tzNow.getHours();
        const currentMinute = tzNow.getMinutes();
        const currentDay = tzNow.getDay();
        const currentDate = tzNow.getDate();

        // Parse scheduled time
        const [schedHour, schedMinute] = schedule.scheduled_time.split(":").map(Number);

        // Check time match (within same minute)
        if (currentHour !== schedHour || currentMinute !== schedMinute) continue;

        // Check schedule type match
        let shouldTrigger = false;
        switch (schedule.schedule_type) {
          case "daily":
            shouldTrigger = true;
            break;
          case "weekly":
            shouldTrigger = schedule.day_of_week === currentDay;
            break;
          case "monthly":
            shouldTrigger = schedule.day_of_month === currentDate;
            break;
          case "one_time": {
            if (schedule.scheduled_date) {
              const [y, m, d] = schedule.scheduled_date.split("-").map(Number);
              shouldTrigger =
                tzNow.getFullYear() === y &&
                tzNow.getMonth() + 1 === m &&
                tzNow.getDate() === d;
            }
            break;
          }
        }

        if (!shouldTrigger) continue;

        // Check if already triggered this minute
        if (schedule.last_triggered_at) {
          const lastTriggered = new Date(schedule.last_triggered_at);
          const diffMs = now.getTime() - lastTriggered.getTime();
          if (diffMs < 60_000) continue; // already triggered within last minute
        }

        // Execute and mark triggered
        try {
          await executeAction(schedule);
          await updateSchedule.mutateAsync({
            id: schedule.id,
            last_triggered_at: now.toISOString(),
            ...(schedule.schedule_type === "one_time" ? { is_active: false } : {}),
          });
          toast.success(`Scheduler: "${schedule.label || schedule.action_type}" executed`);
        } catch (err: any) {
          console.error("Schedule execution failed:", err);
          toast.error(`Scheduler: "${schedule.label || schedule.action_type}" failed`);
        }
      }
    } finally {
      processingRef.current = false;
    }
  }, [schedules, executeAction, updateSchedule]);

  useEffect(() => {
    checkSchedules(); // run immediately
    const interval = setInterval(checkSchedules, 60_000);
    return () => clearInterval(interval);
  }, [checkSchedules]);
};
