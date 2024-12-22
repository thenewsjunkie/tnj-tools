import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { FritzContestant } from "@/integrations/supabase/types/tables/fritz";

const CurrentScore = () => {
  const [contestants, setContestants] = useState<FritzContestant[]>([]);

  useEffect(() => {
    fetchContestants();
    
    const channel = supabase
      .channel('fritz-score-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fritz_contestants'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          fetchContestants();
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchContestants = async () => {
    const { data: contestants, error } = await supabase
      .from('fritz_contestants')
      .select('*')
      .order('position');
    
    if (error) {
      console.error('Error fetching contestants:', error);
      return;
    }

    console.log('Fetched contestants:', contestants);
    setContestants(contestants || []);
  };

  return (
    <div className="min-h-screen text-white p-0">
      <div className="flex">
        {contestants.filter(c => c.name).map((contestant) => (
          <div key={contestant.id} className="relative w-[400px] h-[400px]">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
              {contestant.image_url ? (
                <img
                  src={contestant.image_url}
                  alt={contestant.name || ''}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-900" />
              )}
              {/* Dark overlay for better score visibility */}
              <div className="absolute inset-0 bg-black/60" />
            </div>
            
            {/* Score Overlay - Made larger and more prominent */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[200px] font-['Digital-7'] text-neon-red animate-led-flicker drop-shadow-[0_0_10px_rgba(255,0,0,0.7)]">
                {contestant.score || 0}
              </span>
            </div>
            
            {/* Name Overlay - Made more visible */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4">
              <h2 className="text-3xl text-center font-bold text-white">
                {contestant.name}
              </h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurrentScore;