import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface YearlyScore {
  contestant_name: string;
  total_score: number;
  year: number;
}

const DEFAULT_CONTESTANTS = ['Shawn', 'Sabrina', 'C-Lane'];

const YearlyScores = () => {
  const [scores, setScores] = useState<YearlyScore[]>([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [activeContestants, setActiveContestants] = useState<string[]>([]);

  useEffect(() => {
    // Check for year change every minute
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
      const { data: contestants } = await supabase
        .from('fritz_contestants')
        .select('name')
        .not('name', 'is', null);

      const activeNames = contestants?.map(c => c.name) || [];
      setActiveContestants(activeNames as string[]);
    };

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

      // Filter scores to only show default contestants plus Josh or Custom if they're active
      const filteredScores = data.filter(score => {
        const name = score.contestant_name;
        return DEFAULT_CONTESTANTS.includes(name) || 
               (activeContestants.includes(name) && (name === 'Josh' || name === 'Custom'));
      });

      setScores(filteredScores);
    };

    fetchActiveContestants();
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
          fetchYearlyScores();
        }
      )
      .subscribe();

    // Also listen for changes to active contestants
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
      supabase.removeChannel(channel);
      supabase.removeChannel(contestantsChannel);
    };
  }, [currentYear, activeContestants]);

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