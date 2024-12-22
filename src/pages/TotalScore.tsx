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
      <div className="fixed top-8 left-0 bg-black/80 p-4 backdrop-blur-sm">
        <h3 className="text-xl font-bold mb-2 text-white">Total Score {currentYear}</h3>
        <div className="space-y-1">
          {scores.map((score) => (
            <div key={score.contestant_name} className="flex justify-between text-white bg-black px-2 py-1 rounded">
              <span>{score.contestant_name}:</span>
              <span className="ml-4">{score.total_score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TotalScore;