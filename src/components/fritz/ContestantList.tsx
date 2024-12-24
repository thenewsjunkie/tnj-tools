import { useEffect } from "react";
import { FritzContestant } from "@/integrations/supabase/types/tables/fritz";
import ContestantFrame from "./ContestantFrame";
import { supabase } from "@/integrations/supabase/client";

interface ContestantListProps {
  contestants: FritzContestant[];
  onImageUpload: (position: number, file: File) => void;
  onNameChange: (position: number, name: string) => void;
  onScoreChange: (position: number, increment: boolean) => void;
  onClear: (position: number) => void;
  onImageClear: (position: number) => void;
  setContestants: (contestants: FritzContestant[]) => void;
}

const ContestantList = ({
  contestants,
  onImageUpload,
  onNameChange,
  onScoreChange,
  onClear,
  onImageClear,
  setContestants,
}: ContestantListProps) => {
  useEffect(() => {
    // Subscribe to real-time updates
    const channel = supabase
      .channel('fritz-contestant-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fritz_contestants'
        },
        async (payload) => {
          console.log('Real-time update received:', payload);
          
          // Fetch all contestants to ensure we have the latest state
          const { data: updatedContestants, error } = await supabase
            .from('fritz_contestants')
            .select('*')
            .order('position');
          
          if (error) {
            console.error('Error fetching contestants:', error);
            return;
          }

          setContestants(updatedContestants || []);
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [setContestants]);

  return (
    <div className="flex flex-col md:flex-row md:justify-center gap-8 md:gap-4">
      {[1, 2, 3].map((position) => {
        const contestant = contestants.find(c => c.position === position) || {
          id: `temp-${position}`,
          name: '',
          score: 0,
          image_url: null,
          position
        };

        return (
          <ContestantFrame
            key={position}
            imageUrl={contestant.image_url}
            name={contestant.name}
            score={contestant.score || 0}
            onImageUpload={(file) => onImageUpload(position, file)}
            onNameChange={(name) => onNameChange(position, name)}
            onScoreChange={(increment) => onScoreChange(position, increment)}
            onClear={() => onClear(position)}
            onImageClear={() => onImageClear(position)}
          />
        );
      })}
    </div>
  );
};

export default ContestantList;