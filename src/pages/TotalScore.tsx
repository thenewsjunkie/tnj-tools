import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface YearlyScore {
  contestant_name: string;
  total_score: number;
  year: number;
}

const TotalScore = () => {
  const [scores, setScores] = useState<YearlyScore[]>([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

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
    const fetchYearlyScores = async () => {
      const { data, error } = await supabase
        .from('fritz_yearly_scores')
        .select('*')
        .eq('year', currentYear)
        .order('total_score', { ascending: false });

      if (error) {
        console.error('Error fetching yearly scores:', error);
        return;
      }

      setScores(data);
    };

    fetchYearlyScores();

    const channel = supabase
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
          console.log('Received real-time update:', payload);
          fetchYearlyScores();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentYear]);

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
        </div>
      </div>
    </div>
  );
};

export default TotalScore;