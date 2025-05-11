
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { FritzContestant } from "@/integrations/supabase/types/tables/fritz";
import { cn } from "@/lib/utils";
import ScoreControls from "@/components/fritz/ScoreControls";
import { useSearchParams } from "react-router-dom";

const CurrentScore = () => {
  const [contestants, setContestants] = useState<FritzContestant[]>([]);
  const [searchParams] = useSearchParams();
  
  // Get display preferences from URL parameters
  const compact = searchParams.get('compact') === 'true';
  const position = searchParams.get('position') || 'bottom-right';
  const hideImages = searchParams.get('hideImages') === 'true';
  const showControls = searchParams.get('showControls') === 'true';
  const fontSize = searchParams.get('fontSize') || 'medium'; // small, medium, large
  const layout = searchParams.get('layout') || 'vertical'; // vertical, horizontal

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

  const handleScoreChange = async (contestantId: string, increment: boolean) => {
    // Only show controls if enabled
    if (!showControls) return;

    const { data, error } = await supabase
      .functions
      .invoke('update-fritz-score', {
        body: {
          contestant_id: contestantId,
          increment
        }
      });
    
    if (error) {
      console.error('Error updating score:', error);
    } else {
      console.log('Score updated:', data);
    }
  };

  // Classes for container based on position parameter
  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0',
  }[position] || 'bottom-right';

  // Classes for font size based on fontSize parameter
  const scoreFontSizeClasses = {
    'small': 'text-[80px]',
    'medium': 'text-[120px]',
    'large': 'text-[160px]',
    'xl': 'text-[200px]',
    'xxl': 'text-[240px]',
  }[fontSize] || 'text-[120px]';

  const nameFontSizeClasses = {
    'small': 'text-xl',
    'medium': 'text-2xl',
    'large': 'text-3xl',
    'xl': 'text-4xl',
    'xxl': 'text-5xl',
  }[fontSize] || 'text-2xl';

  const filteredContestants = contestants.filter(c => c.name);
  
  return (
    <div className="min-h-screen bg-black/90 p-0 overflow-hidden">
      {/* Container for the score display */}
      <div 
        className={cn(
          "fixed z-50 p-2", 
          positionClasses,
          compact ? "w-auto" : "w-full"
        )}
      >
        {/* Responsive layout that changes based on compact mode and layout */}
        <div className={cn(
          "flex",
          compact 
            ? layout === 'horizontal' 
              ? "flex-row space-x-2" 
              : "flex-col space-y-2"
            : "flex-row flex-wrap justify-center"
        )}>
          {filteredContestants.map((contestant) => (
            <div 
              key={contestant.id} 
              className={cn(
                "relative group bg-black/80 border border-white/10 rounded-lg overflow-hidden",
                compact 
                  ? layout === 'horizontal'
                    ? "mb-0 h-[120px] w-[180px]"
                    : "mb-0 w-[220px] h-[120px]" 
                  : "w-[400px] h-[400px] mx-1 mb-2"
              )}
            >
              {/* Background Image with Overlay - only shown if not hiding images */}
              {!hideImages && (
                <div className="absolute inset-0">
                  {contestant.image_url ? (
                    <img
                      src={contestant.image_url}
                      alt={contestant.name || ''}
                      className="w-full h-full object-cover opacity-60"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-900" />
                  )}
                  {/* Enhanced gradient overlay for better text visibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/40" />
                </div>
              )}
              
              {/* Score Display - centered for regular mode, side-by-side in compact */}
              <div className={cn(
                "absolute flex items-center justify-center",
                compact 
                  ? layout === 'horizontal'
                    ? "inset-y-0 inset-x-0 pt-1" 
                    : "inset-y-0 left-0 right-1/2" 
                  : "inset-0"
              )}>
                <div className="relative">
                  {/* Score glow effect */}
                  <div className="absolute inset-0 blur-lg bg-neon-red/30 animate-pulse" />
                  <span className={cn(
                    "relative font-['Digital-7'] text-neon-red animate-led-flicker drop-shadow-[0_0_10px_rgba(255,0,0,0.7)]",
                    compact 
                      ? layout === 'horizontal'
                        ? "text-[60px]" 
                        : "text-[80px]"
                      : scoreFontSizeClasses
                  )}>
                    {contestant.score || 0}
                  </span>
                </div>
              </div>
              
              {/* Name Display - bottom for regular, side for compact */}
              <div className={cn(
                "absolute bg-gradient-to-t from-black via-black/90 to-transparent",
                compact
                  ? layout === 'horizontal'
                    ? "bottom-0 left-0 right-0 h-8"
                    : "inset-y-0 left-1/2 right-0 flex items-center justify-center" 
                  : "bottom-0 left-0 right-0 h-16"
              )}>
                <h2 className={cn(
                  "font-bold text-white text-center tracking-wider uppercase px-2",
                  compact
                    ? layout === 'horizontal'
                      ? "text-sm" 
                      : nameFontSizeClasses
                    : "text-4xl px-6 py-2"
                )}>
                  {contestant.name}
                </h2>
              </div>
              
              {/* Score Controls - only shown when showControls is true */}
              {showControls && (
                <div className={cn(
                  "absolute transition-opacity duration-300",
                  compact ? "inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center" 
                          : "bottom-20 left-0 right-0 opacity-0 group-hover:opacity-100"
                )}>
                  <ScoreControls 
                    score={contestant.score || 0} 
                    onScoreChange={(increment) => handleScoreChange(contestant.id, increment)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CurrentScore;
