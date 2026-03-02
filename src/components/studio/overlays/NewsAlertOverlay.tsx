import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface NewsAlert {
  id: string;
  tweet_id: string;
  text: string;
  author: string;
  created_at: string;
}

interface NewsAlertOverlayProps {
  position: "top" | "bottom";
}

const NewsAlertOverlay = ({ position }: NewsAlertOverlayProps) => {
  const [alerts, setAlerts] = useState<NewsAlert[]>([]);
  const [currentAlert, setCurrentAlert] = useState<NewsAlert | null>(null);
  const [visible, setVisible] = useState(false);

  // Subscribe to new inserts via realtime
  useEffect(() => {
    const channel = supabase
      .channel("news-alerts-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "news_alerts" },
        (payload) => {
          const newAlert = payload.new as NewsAlert;
          setAlerts((prev) => [...prev, newAlert]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Process alert queue
  useEffect(() => {
    if (currentAlert || alerts.length === 0) return;

    const next = alerts[0];
    setAlerts((prev) => prev.slice(1));
    setCurrentAlert(next);
    setVisible(true);

    // Auto-dismiss after 15 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => setCurrentAlert(null), 600); // wait for slide-out animation
    }, 15000);

    return () => clearTimeout(timer);
  }, [alerts, currentAlert]);

  if (!currentAlert) return null;

  const positionClass = position === "top" ? "top-0" : "bottom-0";
  const slideIn = position === "top" ? "animate-[slideDown_0.5s_ease-out]" : "animate-[slideUp_0.5s_ease-out]";
  const slideOut = position === "top" ? "animate-[slideUpOut_0.5s_ease-in_forwards]" : "animate-[slideDownOut_0.5s_ease-in_forwards]";

  return (
    <div
      className={`fixed ${positionClass} left-0 right-0 z-[6000] ${visible ? slideIn : slideOut}`}
    >
      <div className="flex items-stretch bg-black/90 border-y border-red-600/50">
        {/* Breaking News badge */}
        <div className="bg-red-600 px-6 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm uppercase tracking-widest whitespace-nowrap">
            Breaking News
          </span>
        </div>
        {/* Tweet text */}
        <div className="flex-1 px-6 py-3 overflow-hidden">
          <p className="text-white text-lg font-medium leading-snug">
            {currentAlert.text}
          </p>
        </div>
        {/* Source */}
        <div className="px-4 flex items-center shrink-0">
          <span className="text-red-400/70 text-xs font-medium">{currentAlert.author}</span>
        </div>
      </div>
    </div>
  );
};

export default NewsAlertOverlay;
