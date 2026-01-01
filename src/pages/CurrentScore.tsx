
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { FritzContestant } from "@/integrations/supabase/types/tables/fritz";
import { cn } from "@/lib/utils";
import ScoreControls from "@/components/fritz/ScoreControls";
import { useSearchParams } from "react-router-dom";

const CurrentScore = () => {
  const [contestants, setContestants] = useState<FritzContestant[]>([]);
  const [searchParams] = useSearchParams();
  const [animatingScores, setAnimatingScores] = useState<Set<string>>(new Set());
  const prevScoresRef = useRef<Map<string, number>>(new Map());
  
  // Get display preferences from URL parameters
  const compact = searchParams.get('compact') === 'true';
  const position = searchParams.get('position') || 'bottom-right';
  const hideImages = searchParams.get('hideImages') === 'true';
  const showControls = searchParams.get('showControls') === 'true';
  const fontSize = searchParams.get('fontSize') || 'medium';
  const layout = searchParams.get('layout') || 'vertical';
  const transparent = searchParams.get('transparent') === 'true';

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

    // Check for score changes and trigger animations
    if (contestants) {
      const newAnimating = new Set<string>();
      contestants.forEach(contestant => {
        const prevScore = prevScoresRef.current.get(contestant.id);
        if (prevScore !== undefined && prevScore !== contestant.score) {
          newAnimating.add(contestant.id);
        }
        prevScoresRef.current.set(contestant.id, contestant.score || 0);
      });
      
      if (newAnimating.size > 0) {
        setAnimatingScores(newAnimating);
        setTimeout(() => setAnimatingScores(new Set()), 600);
      }
    }

    console.log('Fetched contestants:', contestants);
    setContestants(contestants || []);
  };

  const handleScoreChange = async (contestantId: string, increment: boolean) => {
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

  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0',
  }[position] || 'bottom-0 right-0';

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

  // Corner accent component for consistent styling
  const CornerAccent = ({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) => {
    const positionStyles = {
      'top-left': 'top-0 left-0 border-t-2 border-l-2',
      'top-right': 'top-0 right-0 border-t-2 border-r-2',
      'bottom-left': 'bottom-0 left-0 border-b-2 border-l-2',
      'bottom-right': 'bottom-0 right-0 border-b-2 border-r-2',
    };
    
    return (
      <div className={cn(
        "absolute w-4 h-4 border-neon-red",
        positionStyles[position]
      )} />
    );
  };
  
  return (
    <div className={cn(
      "min-h-screen p-4 overflow-hidden",
      transparent ? "bg-transparent" : "bg-black/90"
    )}>
      <div className={cn("fixed z-50 p-2", positionClasses, compact ? "w-auto" : "w-auto max-w-4xl")}>
        {/* Main Container with animated border */}
        <div className="relative">
          {/* Animated gradient border */}
          <div className="absolute -inset-[1px] bg-gradient-to-r from-neon-red via-red-500 to-neon-red rounded-lg opacity-75 blur-[2px] animate-gradient-border" />
          
          {/* Inner container */}
          <div className={cn(
            "relative rounded-lg overflow-hidden",
            transparent ? "bg-black/60 backdrop-blur-md" : "bg-black/90 backdrop-blur-md",
            "shadow-[0_0_30px_rgba(255,0,0,0.2)]"
          )}>
            {/* Corner accents */}
            <CornerAccent position="top-left" />
            <CornerAccent position="top-right" />
            <CornerAccent position="bottom-left" />
            <CornerAccent position="bottom-right" />
            
            {/* Header - only show in non-compact mode */}
            {!compact && (
              <div className="pt-6 pb-4 px-6 text-center">
                {/* Branding */}
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-neon-red text-sm">✦</span>
                  <span className="text-white/60 text-xs tracking-[0.3em] uppercase font-medium">
                    Fritz on the Street
                  </span>
                  <span className="text-neon-red text-sm">✦</span>
                </div>
                
                {/* Title */}
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-wide">
                  CURRENT GAME
                </h1>
                
                {/* Decorative divider */}
                <div className="flex items-center justify-center mt-3 gap-2">
                  <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-neon-red/50" />
                  <div className="w-1.5 h-1.5 rotate-45 bg-neon-red" />
                  <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-neon-red/50" />
                </div>
              </div>
            )}
            
            {/* Contestants Grid */}
            <div className={cn(
              "p-4",
              compact ? "pt-2" : "pt-0"
            )}>
              <div className={cn(
                "flex gap-3",
                compact 
                  ? layout === 'horizontal' 
                    ? "flex-row" 
                    : "flex-col"
                  : "flex-row flex-wrap justify-center"
              )}>
                {filteredContestants.map((contestant, index) => (
                  <div 
                    key={contestant.id} 
                    className={cn(
                      "relative group overflow-hidden rounded-lg",
                      "border-l-2 border-neon-red",
                      "bg-gradient-to-br from-black/80 via-black/60 to-black/80",
                      "shadow-[0_0_15px_rgba(255,0,0,0.1)]",
                      "animate-slide-in-bottom",
                      animatingScores.has(contestant.id) && "animate-score-pulse",
                      compact 
                        ? layout === 'horizontal'
                          ? "h-[100px] w-[140px]"
                          : "w-[180px] h-[100px]" 
                        : "w-[280px] h-[320px]"
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Background Image */}
                    {!hideImages && contestant.image_url && (
                      <div className="absolute inset-0">
                        <img
                          src={contestant.image_url}
                          alt={contestant.name || ''}
                          className="w-full h-full object-cover opacity-50"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
                      </div>
                    )}
                    
                    {/* Score Display */}
                    <div className={cn(
                      "absolute flex items-center justify-center",
                      compact 
                        ? layout === 'horizontal'
                          ? "inset-0 pb-6" 
                          : "inset-y-0 left-0 right-1/2" 
                        : "inset-0 pb-12"
                    )}>
                      <div className="relative">
                        {/* Score glow */}
                        <div className="absolute inset-0 blur-xl bg-neon-red/20 animate-pulse" />
                        <span className={cn(
                          "relative font-['Digital-7'] text-neon-red",
                          "drop-shadow-[0_0_15px_rgba(255,0,0,0.8)]",
                          "animate-led-flicker",
                          compact 
                            ? layout === 'horizontal'
                              ? "text-[48px]" 
                              : "text-[56px]"
                            : scoreFontSizeClasses
                        )}>
                          {contestant.score || 0}
                        </span>
                      </div>
                    </div>
                    
                    {/* Name Display */}
                    <div className={cn(
                      "absolute",
                      compact
                        ? layout === 'horizontal'
                          ? "bottom-0 left-0 right-0 h-6 flex items-center justify-center"
                          : "inset-y-0 left-1/2 right-0 flex items-center justify-center" 
                        : "bottom-0 left-0 right-0 py-3"
                    )}>
                      <div className="bg-gradient-to-t from-black/90 via-black/70 to-transparent absolute inset-0" />
                      <h2 className={cn(
                        "relative font-bold text-white text-center tracking-wider uppercase",
                        "drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]",
                        compact
                          ? layout === 'horizontal'
                            ? "text-xs" 
                            : "text-sm"
                          : "text-xl px-4"
                      )}>
                        {contestant.name}
                      </h2>
                    </div>
                    
                    {/* Score Controls */}
                    {showControls && (
                      <div className={cn(
                        "absolute transition-opacity duration-300",
                        compact 
                          ? "inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center bg-black/60" 
                          : "bottom-16 left-0 right-0 opacity-0 group-hover:opacity-100"
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
        </div>
      </div>
    </div>
  );
};

export default CurrentScore;
