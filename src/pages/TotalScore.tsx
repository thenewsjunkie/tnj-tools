import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface YearlyScore {
  contestant_name: string;
  total_score: number;
  year: number;
}

const DEFAULT_CONTESTANTS = ['Shawn', 'Sabrina', 'C-Lane'];

const TotalScore = () => {
  const [scores, setScores] = useState<YearlyScore[]>([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [activeContestants, setActiveContestants] = useState<string[]>([]);

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
        console.log('[TotalScore] Fetching active contestants...');
        const { data: contestants, error } = await supabase
          .from('fritz_contestants')
          .select('name')
          .not('name', 'is', null);

        if (error) {
          console.error('[TotalScore] Error fetching active contestants:', error);
          return;
        }

        const activeNames = contestants?.map(c => c.name) || [];
        console.log('[TotalScore] Active contestants:', activeNames);
        setActiveContestants(activeNames as string[]);
      } catch (error) {
        console.error('[TotalScore] Error in fetchActiveContestants:', error);
      }
    };

    const fetchYearlyScores = async () => {
      try {
        console.log('[TotalScore] Fetching yearly scores for year:', currentYear);
        const { data, error } = await supabase
          .from('fritz_yearly_scores')
          .select('*')
          .eq('year', currentYear)
          .order('total_score', { ascending: false });

        if (error) {
          console.error('[TotalScore] Error fetching yearly scores:', error);
          return;
        }

        console.log('[TotalScore] Raw scores from database:', data);

        if (!data || data.length === 0) {
          console.log('[TotalScore] No scores found for year:', currentYear);
          setScores([]);
          return;
        }

        // Filter scores to only show default contestants plus Josh or Custom if they're active
        const filteredScores = data.filter(score => {
          const name = score.contestant_name;
          const isDefaultContestant = DEFAULT_CONTESTANTS.includes(name);
          const isSpecialContestant = activeContestants.includes(name) && 
                                    (name === 'Josh' || name === 'Custom');
          
          return isDefaultContestant || isSpecialContestant;
        });

        console.log('[TotalScore] Filtered scores:', filteredScores);
        setScores(filteredScores);
      } catch (error) {
        console.error('[TotalScore] Error in fetchYearlyScores:', error);
      }
    };

    // Initial fetch
    fetchActiveContestants();
    fetchYearlyScores();

    // Subscribe to real-time updates for yearly scores
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
        (payload) => {
          console.log('[TotalScore] Yearly scores update received:', payload);
          fetchYearlyScores();
        }
      )
      .subscribe((status) => {
        console.log('[TotalScore] Yearly scores subscription status:', status);
      });

    // Subscribe to changes in active contestants
    const contestantsChannel = supabase
      .channel('contestants-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fritz_contestants'
        },
        (payload) => {
          console.log('[TotalScore] Contestants update received:', payload);
          fetchActiveContestants();
          fetchYearlyScores();
        }
      )
      .subscribe((status) => {
        console.log('[TotalScore] Contestants subscription status:', status);
      });

    return () => {
      yearlyScoresChannel.unsubscribe();
      contestantsChannel.unsubscribe();
    };
  }, [currentYear]);

  // Create placeholder scores to maintain consistent height
  const placeholderCount = Math.max(0, 4 - scores.length);
  const placeholderScores = Array(placeholderCount).fill(null);

  return (
    <div className="min-h-screen">
      <div className="fixed top-8 left-8 w-[300px] bg-black/80 rounded-lg overflow-hidden backdrop-blur-sm">
        {/* Title Bar */}
        <div className="relative px-6 py-4 bg-gradient-to-r from-black via-black/90 to-black/80">
          <h3 className="text-2xl font-bold text-white text-center tracking-wider uppercase">
            Total Score {currentYear}
          </h3>
          {/* Accent line under title */}
          <div className="h-1 bg-neon-red mt-2 mx-auto w-2/3 rounded-full shadow-[0_0_10px_rgba(242,21,22,0.7)]" />
        </div>

        {/* Scores List */}
        <div className="space-y-3 p-4">
          {scores.map((score) => (
            <div 
              key={score.contestant_name} 
              className="relative flex justify-between items-center bg-black/60 px-4 py-3 rounded-lg backdrop-blur-sm"
            >
              {/* Name */}
              <span className="text-lg font-semibold text-white tracking-wide uppercase">
                {score.contestant_name}
              </span>
              
              {/* Score with glow effect */}
              <div className="relative">
                <div className="absolute inset-0 blur-lg bg-neon-red/30 animate-pulse" />
                <span className="relative text-4xl font-['Digital-7'] text-neon-red animate-led-flicker drop-shadow-[0_0_10px_rgba(255,0,0,0.7)]">
                  {score.total_score}
                </span>
              </div>
            </div>
          ))}
          {/* Invisible placeholder scores to maintain height */}
          {placeholderScores.map((_, index) => (
            <div 
              key={`placeholder-${index}`}
              className="relative flex justify-between items-center px-4 py-3 rounded-lg invisible"
              aria-hidden="true"
            >
              <span className="text-lg font-semibold tracking-wide uppercase">
                Placeholder
              </span>
              <div className="relative">
                <span className="text-4xl font-['Digital-7']">
                  0
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TotalScore;