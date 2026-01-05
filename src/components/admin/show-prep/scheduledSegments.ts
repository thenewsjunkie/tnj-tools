import { getDay } from "date-fns";

export interface ScheduledSegment {
  id?: string;
  time: string;
  name: string;
  hour_block: string;
  days: number[];
  is_active: boolean;
}

export const isWeekend = (date: Date): boolean => {
  const day = getDay(date);
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
};

export const getScheduledSegments = (
  date: Date,
  hourId: string,
  allSegments: ScheduledSegment[]
): ScheduledSegment[] => {
  if (isWeekend(date)) return [];

  const dayOfWeek = getDay(date); // 0 = Sunday, 1 = Monday, etc.

  // Filter segments for this hour block and day
  const segments = allSegments.filter(
    (s) => s.is_active && s.hour_block === hourId && s.days.includes(dayOfWeek)
  );

  // Sort by time
  return segments.sort((a, b) => {
    const parseTime = (t: string) => {
      const [time, period] = t.split(" ");
      let [hours, mins] = time.split(":").map(Number);
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      return hours * 60 + mins;
    };
    return parseTime(a.time) - parseTime(b.time);
  });
};

// Get all scheduled segments for a day (not filtered by hour)
export const getAllScheduledSegments = (
  date: Date,
  allSegments: ScheduledSegment[]
): ScheduledSegment[] => {
  if (isWeekend(date)) return [];

  const dayOfWeek = getDay(date);

  return allSegments.filter(
    (s) => s.is_active && s.days.includes(dayOfWeek)
  );
};
