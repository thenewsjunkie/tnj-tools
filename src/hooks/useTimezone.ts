import { useEffect, useState } from "react";
import { format, formatInTimeZone } from "date-fns-tz";
import { supabase } from "@/integrations/supabase/client";

export const useTimezone = () => {
  const [userTimezone, setUserTimezone] = useState<string>("UTC");

  useEffect(() => {
    fetchUserTimezone();
  }, []);

  const fetchUserTimezone = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('timezone')
        .eq('id', session.user.id)
        .single();

      if (profile?.timezone) {
        setUserTimezone(profile.timezone);
      }
    } catch (error) {
      console.error('Error fetching timezone:', error);
    }
  };

  const formatDate = (date: Date | string, formatString: string = 'PPpp') => {
    try {
      return formatInTimeZone(
        typeof date === 'string' ? new Date(date) : date,
        userTimezone,
        formatString
      );
    } catch (error) {
      console.error('Error formatting date:', error);
      return format(new Date(date), formatString);
    }
  };

  return {
    userTimezone,
    formatDate,
  };
};