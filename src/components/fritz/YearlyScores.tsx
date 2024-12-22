import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface YearlyScore {
  contestant_name: string;
  total_score: number;
  year: number;
}

const YearlyScores = () => {
  const [scores, setScores] = useState<YearlyScore[]>([]);
  const currentYear = new Date().getFullYear();

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
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fritz_yearly_scores',
          filter: `year=eq.${currentYear}`
        },
        () => {
          // Refetch scores when any changes occur
          fetchYearlyScores();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentYear]);

  return (
    <div className="fixed bottom-8 right-8 bg-black/20 p-4 rounded-lg backdrop-blur-sm">
      <h3 className="text-xl font-bold mb-2 text-white">Total Score {currentYear}</h3>
      <div className="space-y-1">
        {scores.map((score) => (
          <div key={score.contestant_name} className="flex justify-between text-white">
            <span>{score.contestant_name}:</span>
            <span className="ml-4">{score.total_score}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YearlyScores;