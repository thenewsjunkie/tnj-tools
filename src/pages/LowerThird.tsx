import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import Guest from "@/components/lower-thirds/Guest";
import Content from "@/components/lower-thirds/Content";
import TickerText from "@/components/lower-thirds/TickerText";

const LowerThird = () => {
  const [lowerThird, setLowerThird] = useState<Tables<"lower_thirds"> | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const fetchActiveLowerThird = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("lower_thirds")
        .select("*")
        .eq("is_active", true)
        .single();

      if (error) {
        console.error("Error fetching lower third:", error);
        if (isVisible) {
          setIsVisible(false);
          setTimeout(() => {
            setLowerThird(null);
            setIsLoading(false);
          }, 400);
        }
        return;
      }

      if (data) {
        // Check if the lower third should still be active based on duration
        if (data.duration_seconds) {
          const activatedAt = new Date(data.updated_at);
          const expiresAt = new Date(activatedAt.getTime() + data.duration_seconds * 1000);
          if (expiresAt <= new Date()) {
            if (isVisible) {
              setIsVisible(false);
              setTimeout(() => {
                setLowerThird(null);
                setIsLoading(false);
              }, 400);
            }
            return;
          }
        }

        // Only update if the data has changed
        if (!lowerThird || lowerThird.id !== data.id || lowerThird.updated_at !== data.updated_at) {
          setIsVisible(false);
          setTimeout(() => {
            setLowerThird(data);
            setIsLoading(false);
            setTimeout(() => {
              setIsVisible(true);
            }, 50);
          }, 400);
        } else {
          setIsLoading(false);
        }
      } else {
        if (isVisible) {
          setIsVisible(false);
          setTimeout(() => {
            setLowerThird(null);
            setIsLoading(false);
          }, 400);
        }
      }
    };

    // Initial fetch
    fetchActiveLowerThird();

    // Set up polling every 2 seconds
    const pollInterval = setInterval(fetchActiveLowerThird, 2000);

    // Set up real-time subscription
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lower_thirds",
          filter: "is_active=eq.true",
        },
        (payload) => {
          console.log("Lower third changed:", payload);
          fetchActiveLowerThird();
        }
      )
      .subscribe();

    return () => {
      clearInterval(timer);
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [lowerThird, isVisible]);

  if (!lowerThird || isLoading) return null;

  const { type, guest_image_url, ticker_text } = lowerThird;

  return (
    <div className={`fixed bottom-0 left-0 w-full transition-opacity duration-400 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex items-end w-full">
        {type === "guest" && guest_image_url ? (
          <Guest imageUrl={guest_image_url} type={type} isVisible={isVisible} />
        ) : null}

        <div className={`flex-1 relative overflow-hidden ${isVisible ? 'animate-slide-in-bottom' : ''}`} style={{ height: type === "guest" ? '280px' : 'auto' }}>
          <Content lowerThird={lowerThird} currentTime={currentTime} isVisible={isVisible} />
        </div>
      </div>

      <TickerText text={ticker_text} />
    </div>
  );
};

export default LowerThird;