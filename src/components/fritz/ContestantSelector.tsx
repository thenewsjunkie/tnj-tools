import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { FritzDefaultContestant } from "@/integrations/supabase/types/tables/fritz";

interface ContestantSelectorProps {
  onSelectContestant: (name: string) => void;
}

const ContestantSelector = ({ onSelectContestant }: ContestantSelectorProps) => {
  const [defaultContestants, setDefaultContestants] = useState<FritzDefaultContestant[]>([]);

  useEffect(() => {
    fetchDefaultContestants();
  }, []);

  const fetchDefaultContestants = async () => {
    const { data, error } = await supabase
      .from('fritz_default_contestants')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching default contestants:', error);
      return;
    }

    console.log('Fetched default contestants:', data);
    setDefaultContestants(data || []);
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
      {defaultContestants.map((contestant) => (
        <Button
          key={contestant.id}
          variant="outline"
          onClick={() => {
            console.log('Selecting contestant:', contestant.name);
            onSelectContestant(contestant.name);
          }}
          className="text-white hover:text-white hover:bg-gray-700"
        >
          {contestant.name}
        </Button>
      ))}
    </div>
  );
};

export default ContestantSelector;