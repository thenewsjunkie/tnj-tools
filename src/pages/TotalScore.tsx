import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Trophy } from "lucide-react";

interface YearlyScore {
  contestant_name: string;
  total_score: number;
  year: number;
}

const DEFAULT_CONTESTANTS = ['Shawn', 'Sabrina', 'C-Lane'];

const TotalScore = () => {
  const [searchParams] = useSearchParams();
  const [scores, setScores] = useState<YearlyScore[]>([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [activeContestants, setActiveContestants] = useState<string[]>([]);
  const [animatingScores, setAnimatingScores] = useState<Set<string>>(new Set());

  // URL parameters for customization
  const position = searchParams.get('position') || 'top-left';
  const compact = searchParams.get('compact') === 'true';
  const showRank = searchParams.get('showRank') !== 'false';
  const transparent = searchParams.get('transparent') === 'true';

  useEffect(() => {
    const interval = setInterval(() => {
      const newYear = new Date().getFullYear();
      if (newYear !== currentYear) {
        setCurrentYear(newYear);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [currentYear]);

  useEffect(() => {
    const fetchActiveContestants = async () => {
      try {
        const { data: contestants, error } = await supabase
          .from('fritz_contestants')
          .select('name')
          .not('name', 'is', null);

        if (error) {
          console.error('[TotalScore] Error fetching active contestants:', error);
          return;
        }

        const activeNames = contestants?.map(c => c.name) || [];
        setActiveContestants(activeNames as string[]);
      } catch (error) {
        console.error('[TotalScore] Error in fetchActiveContestants:', error);
      }
    };

    const fetchYearlyScores = async () => {
      try {
        const { data, error } = await supabase
          .from('fritz_yearly_scores')
          .select('*')
          .eq('year', currentYear)
          .order('total_score', { ascending: false });

        if (error) {
          console.error('[TotalScore] Error fetching yearly scores:', error);
          return;
        }

        if (!data || data.length === 0) {
          setScores([]);
          return;
        }

        const filteredScores = data.filter(score => {
          const name = score.contestant_name;
          const isDefaultContestant = DEFAULT_CONTESTANTS.includes(name);
          const isSpecialContestant = activeContestants.includes(name) && 
                                    (name === 'Josh' || name === 'Custom');
          
          return isDefaultContestant || isSpecialContestant;
        });

        // Detect score changes and trigger animations
        filteredScores.forEach(newScore => {
          const oldScore = scores.find(s => s.contestant_name === newScore.contestant_name);
          if (oldScore && oldScore.total_score !== newScore.total_score) {
            setAnimatingScores(prev => new Set(prev).add(newScore.contestant_name));
            setTimeout(() => {
              setAnimatingScores(prev => {
                const next = new Set(prev);
                next.delete(newScore.contestant_name);
                return next;
              });
            }, 600);
          }
        });

        setScores(filteredScores);
      } catch (error) {
        console.error('[TotalScore] Error in fetchYearlyScores:', error);
      }
    };

    fetchActiveContestants();
    fetchYearlyScores();

    const yearlyScoresChannel = supabase
      .channel('yearly-scores-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fritz_yearly_scores',
          filter: `year=eq.${currentYear}`
        },
        () => fetchYearlyScores()
      )
      .subscribe();

    const contestantsChannel = supabase
      .channel('contestants-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fritz_contestants'
        },
        () => {
          fetchActiveContestants();
          fetchYearlyScores();
        }
      )
      .subscribe();

    return () => {
      yearlyScoresChannel.unsubscribe();
      contestantsChannel.unsubscribe();
    };
  }, [currentYear, scores]);

  const positionClasses = {
    'top-left': 'top-8 left-8',
    'top-right': 'top-8 right-8',
    'bottom-left': 'bottom-8 left-8',
    'bottom-right': 'bottom-8 right-8',
  }[position] || 'top-8 left-8';

  const getRankStyle = (rank: number) => {
    if (!showRank) return { border: 'border-l-neon-red', bg: '', text: 'text-white', glow: 'shadow-[0_0_15px_rgba(242,21,22,0.4)]' };
    
    switch (rank) {
      case 1:
        return {
          border: 'border-l-podium-gold',
          bg: 'bg-gradient-to-r from-podium-gold/20 to-transparent',
          text: 'text-podium-gold',
          glow: 'shadow-[0_0_20px_rgba(255,215,0,0.3)]'
        };
      case 2:
        return {
          border: 'border-l-podium-silver',
          bg: 'bg-gradient-to-r from-podium-silver/15 to-transparent',
          text: 'text-podium-silver',
          glow: 'shadow-[0_0_15px_rgba(192,192,192,0.3)]'
        };
      case 3:
        return {
          border: 'border-l-podium-bronze',
          bg: 'bg-gradient-to-r from-podium-bronze/15 to-transparent',
          text: 'text-podium-bronze',
          glow: 'shadow-[0_0_15px_rgba(205,127,50,0.3)]'
        };
      default:
        return {
          border: 'border-l-neon-red',
          bg: '',
          text: 'text-white',
          glow: 'shadow-[0_0_15px_rgba(242,21,22,0.4)]'
        };
    }
  };

  const getRankBadge = (rank: number) => {
    if (!showRank) return null;
    
    if (rank === 1) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-podium-gold/20 border border-podium-gold/50">
          <Trophy className="w-4 h-4 text-podium-gold" />
        </div>
      );
    }
    
    const colors = {
      2: 'bg-podium-silver/20 border-podium-silver/50 text-podium-silver',
      3: 'bg-podium-bronze/20 border-podium-bronze/50 text-podium-bronze',
    }[rank] || 'bg-white/10 border-white/20 text-white/70';
    
    return (
      <div className={`flex items-center justify-center w-8 h-8 rounded-full border ${colors}`}>
        <span className="text-sm font-bold">{rank}</span>
      </div>
    );
  };

  const placeholderCount = Math.max(0, 4 - scores.length);
  const placeholderScores = Array(placeholderCount).fill(null);

  return (
    <div className="min-h-screen">
      <div 
        className={`fixed ${positionClasses} ${compact ? 'w-[280px]' : 'w-[340px]'} rounded-xl overflow-hidden ${
          transparent ? 'bg-transparent' : 'bg-black/90 backdrop-blur-md'
        } ${!transparent ? 'border border-white/10' : ''}`}
      >
        {/* Animated border glow */}
        {!transparent && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-neon-red/20 via-transparent to-neon-red/20 animate-gradient-border pointer-events-none" />
        )}
        
        {/* Header */}
        <div className="relative px-6 py-4">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-neon-red" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-neon-red" />
          
          {/* Branding */}
          <div className="text-center">
            <span className="text-xs tracking-[0.3em] text-neon-red/80 uppercase font-semibold">
              Fritz on the Street
            </span>
            <h3 className={`${compact ? 'text-xl' : 'text-2xl'} font-bold text-white tracking-wider uppercase mt-1`}>
              <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                Total Score
              </span>
              <span className="text-neon-red ml-2">{currentYear}</span>
            </h3>
          </div>
          
          {/* Decorative divider */}
          <div className="flex items-center justify-center mt-3 gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neon-red/50 to-neon-red" />
            <div className="w-2 h-2 rotate-45 bg-neon-red shadow-[0_0_10px_rgba(242,21,22,0.7)]" />
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-neon-red/50 to-neon-red" />
          </div>
        </div>

        {/* Scores List */}
        <div className={`${compact ? 'space-y-2 p-3' : 'space-y-3 p-4'}`}>
          {scores.map((score, index) => {
            const rank = index + 1;
            const style = getRankStyle(rank);
            const isAnimating = animatingScores.has(score.contestant_name);
            
            return (
              <div 
                key={score.contestant_name}
                className={`
                  relative flex items-center gap-3 
                  ${compact ? 'px-3 py-2' : 'px-4 py-3'} 
                  rounded-lg 
                  bg-black/60 backdrop-blur-sm
                  border-l-4 ${style.border}
                  ${style.bg}
                  ${style.glow}
                  transition-all duration-300
                  animate-slide-in-bottom
                  ${isAnimating ? 'animate-score-pulse' : ''}
                `}
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
              >
                {/* Rank Badge */}
                {showRank && getRankBadge(rank)}
                
                {/* Name */}
                <span className={`
                  flex-1 
                  ${compact ? 'text-base' : 'text-lg'} 
                  font-semibold tracking-wide uppercase
                  ${rank === 1 && showRank ? 'text-podium-gold' : 'text-white'}
                `}>
                  {score.contestant_name}
                </span>
                
                {/* Score */}
                <div className="relative">
                  {rank === 1 && showRank && (
                    <div className="absolute inset-0 blur-xl bg-podium-gold/30 animate-pulse" />
                  )}
                  <span className={`
                    relative 
                    ${compact ? 'text-3xl' : 'text-4xl'} 
                    font-['Digital-7'] 
                    ${rank === 1 && showRank ? 'text-podium-gold' : 'text-neon-red'}
                    animate-led-flicker
                    drop-shadow-[0_0_10px_rgba(255,0,0,0.7)]
                  `}>
                    {score.total_score}
                  </span>
                </div>
              </div>
            );
          })}
          
          {/* Placeholders */}
          {placeholderScores.map((_, index) => (
            <div 
              key={`placeholder-${index}`}
              className={`relative flex items-center gap-3 ${compact ? 'px-3 py-2' : 'px-4 py-3'} rounded-lg invisible`}
              aria-hidden="true"
            >
              {showRank && <div className="w-8 h-8" />}
              <span className={`flex-1 ${compact ? 'text-base' : 'text-lg'} font-semibold`}>Placeholder</span>
              <span className={`${compact ? 'text-3xl' : 'text-4xl'} font-['Digital-7']`}>0</span>
            </div>
          ))}
        </div>
        
        {/* Bottom corner accents */}
        {!transparent && (
          <>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-neon-red/50" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-neon-red/50" />
          </>
        )}
      </div>
    </div>
  );
};

export default TotalScore;
