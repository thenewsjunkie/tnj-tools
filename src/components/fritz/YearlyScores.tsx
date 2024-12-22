import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface YearlyScore {
  contestant_name: string;
  total_score: number;
  year: number;
}

const YearlyScores = () => {
  const [scores, setScores] = useState<YearlyScore[]>([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    // Check for year change every minute
    const interval = setInterval(() => {
      const newYear = new Date().getFullYear();
      if (newYear !== currentYear) {
        setCurrentYear(newYear);
        initializeYearlyScores(newYear);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [currentYear]);

  const initializeYearlyScores = async (year: number) => {
    // Get all unique contestant names from the previous year
    const { data: previousScores } = await supabase
      .from('fritz_yearly_scores')
      .select('contestant_name')
      .eq('year', year - 1);

    if (previousScores) {
      // Create new entries for each contestant with 0 score for the new year
      const newEntries = previousScores.map(score => ({
        contestant_name: score.contestant_name,
        total_score: 0,
        year: year
      }));

      if (newEntries.length > 0) {
        await supabase
          .from('fritz_yearly_scores')
          .insert(newEntries);
      }
    }
  };

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

    // Subscribe to real-time changes
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
          fetchYearlyScores(); // Refetch all scores to ensure correct ordering
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentYear]);

  return (
    <div className="md:fixed relative bottom-8 right-8 bg-black/80 p-4 rounded-lg backdrop-blur-sm mt-8 mx-4 md:mx-0">
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
  );
};

export default YearlyScores;