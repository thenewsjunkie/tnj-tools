import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import TickerText from "@/components/lower-thirds/TickerText";
import GuestSection from "@/components/lower-thirds/display/GuestSection";
import ContentSection from "@/components/lower-thirds/display/ContentSection";
import TypeLabel from "@/components/lower-thirds/display/TypeLabel";

const LowerThird = () => {
  const [lowerThird, setLowerThird] = useState<Tables<"lower_thirds"> | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [logoLoaded, setLogoLoaded] = useState(false);

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
          setLogoLoaded(false);
        }, 400);
        return;
      }

      if (data) {
        setIsVisible(false);
        setTimeout(() => {
          setLowerThird(data);
          setIsLoading(false);
          // If there's no logo, we can show the content immediately
          if (!data.logo_url) {
            setLogoLoaded(true);
          }
        }, 400);
      } else {
        setIsVisible(false);
        setTimeout(() => {
          setLowerThird(null);
          setIsLoading(false);
          setLogoLoaded(false);
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
              setLogoLoaded(false);
            }, 400);
          } else {
            setIsVisible(false);
            setTimeout(() => {
              setLowerThird(payload.new as Tables<"lower_thirds">);
              if (!payload.new.logo_url) {
                setLogoLoaded(true);
              }
            }, 400);
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(timer);
      supabase.removeChannel(channel);
    };
  }, []);

  // Effect to handle logo loading and visibility
  useEffect(() => {
    if (lowerThird && !isLoading) {
      if (lowerThird.logo_url) {
        // Preload the logo image
        const img = new Image();
        img.onload = () => {
          setLogoLoaded(true);
        };
        img.src = lowerThird.logo_url;
      }
      
      // Set visibility after a short delay, whether there's a logo or not
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [lowerThird, isLoading]);

  if (!lowerThird || isLoading) return null;

  const { primary_text, secondary_text, ticker_text, show_time, type, guest_image_url, logo_url } = lowerThird;

  return (
    <div className={`fixed bottom-0 left-0 w-full transition-opacity duration-400 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex items-end w-full">
        {type === "guest" && guest_image_url ? (
          <GuestSection
            guestImageUrl={guest_image_url}
            type={type}
            isVisible={isVisible}
          />
        ) : (
          <TypeLabel type={type} isVisible={isVisible} />
        )}

        <ContentSection
          primaryText={primary_text}
          secondaryText={secondary_text}
          showTime={show_time}
          currentTime={currentTime}
          logoUrl={logo_url}
          type={type}
          isVisible={isVisible}
          logoLoaded={logoLoaded}
        />
      </div>

      <TickerText text={ticker_text} />
    </div>
  );
};

export default LowerThird;