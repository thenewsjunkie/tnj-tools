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
        setIsVisible(false);
        setTimeout(() => {
          setLowerThird(null);
          setIsLoading(false);
        }, 400);
        return;
      }

      if (data) {
        setIsVisible(false);
        setTimeout(() => {
          setLowerThird(data);
          setIsLoading(false);
          setTimeout(() => {
            setIsVisible(true);
          }, 50);
        }, 400);
      } else {
        setIsVisible(false);
        setTimeout(() => {
          setLowerThird(null);
          setIsLoading(false);
        }, 400);
      }
    };

    fetchActiveLowerThird();

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
          if (payload.eventType === "DELETE" || !payload.new.is_active) {
            setIsVisible(false);
            setTimeout(() => {
              setLowerThird(null);
            }, 400);
          } else {
            setIsVisible(false);
            setTimeout(() => {
              setLowerThird(payload.new as Tables<"lower_thirds">);
              setTimeout(() => {
                setIsVisible(true);
              }, 50);
            }, 400);
          }
        }
      )
      .subscribe();

    const updateChannel = supabase
      .channel("active-lower-third-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "lower_thirds",
        },
        (payload) => {
          if (lowerThird && payload.old.id === lowerThird.id) {
            if (!payload.new.is_active) {
              setIsVisible(false);
              setTimeout(() => {
                setLowerThird(null);
              }, 400);
            } else {
              setIsVisible(false);
              setTimeout(() => {
                setLowerThird(payload.new as Tables<"lower_thirds">);
                setTimeout(() => {
                  setIsVisible(true);
                }, 50);
              }, 400);
            }
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(timer);
      supabase.removeChannel(channel);
      supabase.removeChannel(updateChannel);
    };
  }, [lowerThird?.id]);

  if (!lowerThird || isLoading) return null;

  const { type, guest_image_url, ticker_text } = lowerThird;

  return (
    <div className={`fixed bottom-0 left-0 w-full transition-opacity duration-400 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex items-end w-full">
        {type === "guest" && guest_image_url ? (
          <Guest imageUrl={guest_image_url} type={type} isVisible={isVisible} />
        ) : (
          <div className="absolute -top-16 left-0 z-10">
            <div className={`bg-black/85 text-white px-8 py-4 text-xl font-bold uppercase ${isVisible ? 'animate-fade-in' : ''}`}>
              {type}
            </div>
          </div>
        )}

        <div className={`flex-1 relative overflow-hidden ${isVisible ? 'animate-slide-in-bottom' : ''}`} style={{ height: type === "guest" ? '280px' : 'auto' }}>
          <Content lowerThird={lowerThird} currentTime={currentTime} isVisible={isVisible} />
        </div>
      </div>

      <TickerText text={ticker_text} />
    </div>
  );
};

export default LowerThird;