import { getDay } from "date-fns";

export interface ScheduledSegment {
  time: string;
  name: string;
}

// Monday-specific segments
const MONDAY_SEGMENTS: Record<string, ScheduledSegment[]> = {
  "hour-2": [{ time: "12:00 PM", name: "Amy Kaufeldt - Fox 35" }],
  "hour-4": [{ time: "2:00 PM", name: "Rate My Blank" }],
};

// Weekday segments (Mon-Fri)
const WEEKDAY_SEGMENTS: Record<string, ScheduledSegment[]> = {
  "hour-2": [{ time: "12:30 PM", name: "The Next Episode" }],
  "hour-3": [{ time: "1:30 PM", name: "Jury Duty" }],
  "hour-4": [{ time: "2:45 PM", name: "Final Dispatches / Stories That Didn't Make the Cut / Today I Learned" }],
};

export const isWeekend = (date: Date): boolean => {
  const day = getDay(date);
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
};

export const getScheduledSegments = (date: Date, hourId: string): ScheduledSegment[] => {
  if (isWeekend(date)) return [];

  const day = getDay(date);
  const isMonday = day === 1;

  const segments: ScheduledSegment[] = [];

  // Add Monday-specific segments
  if (isMonday && MONDAY_SEGMENTS[hourId]) {
    segments.push(...MONDAY_SEGMENTS[hourId]);
  }

  // Add weekday segments
  if (WEEKDAY_SEGMENTS[hourId]) {
    segments.push(...WEEKDAY_SEGMENTS[hourId]);
  }

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
