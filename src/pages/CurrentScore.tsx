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
    <div className="min-h-screen bg-black/90 p-0">
      <div className="flex">
        {contestants.filter(c => c.name).map((contestant) => (
          <div key={contestant.id} className="relative w-[400px] h-[400px] group">
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
              {/* Gradient overlay for better text visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            </div>
            
            {/* Score Display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Score glow effect */}
                <div className="absolute inset-0 blur-lg bg-neon-red/30 animate-pulse" />
                <span className="relative text-[200px] font-['Digital-7'] text-neon-red animate-led-flicker drop-shadow-[0_0_10px_rgba(255,0,0,0.7)]">
                  {contestant.score || 0}
                </span>
              </div>
            </div>
            
            {/* Name Display */}
            <div className="absolute bottom-0 left-0 right-0">
              {/* Name background with gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-transparent h-32" />
              <div className="relative px-6 py-4">
                <h2 className="text-4xl font-bold text-white text-center tracking-wider uppercase">
                  {contestant.name}
                </h2>
                {/* Accent line under name */}
                <div className="h-1 bg-neon-red mt-2 mx-auto w-2/3 rounded-full shadow-[0_0_10px_rgba(242,21,22,0.7)]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurrentScore;