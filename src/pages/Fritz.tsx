import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { FritzContestant } from "@/integrations/supabase/types/tables/fritz";
import Header from "@/components/fritz/Header";
import ContestantSelector from "@/components/fritz/ContestantSelector";
import FritzContestantManager from "@/components/fritz/FritzContestantManager";
import YearlyScores from "@/components/fritz/YearlyScores";

const DEFAULT_CONTESTANTS = ['Shawn', 'Sabrina', 'C-Lane'];

const Fritz = () => {
  const [contestants, setContestants] = useState<FritzContestant[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchContestants();
  }, []);

  const fetchContestants = async () => {
    const { data: existingContestants, error: fetchError } = await supabase
      .from('fritz_contestants')
      .select('*')
      .order('position');
    
    if (fetchError) {
      console.error('Error fetching contestants:', fetchError);
      return;
    }

    if (!existingContestants || existingContestants.length < 3) {
      await initializeDefaultContestants(existingContestants || []);
    } else {
      setContestants(existingContestants);
    }
  };

  const initializeDefaultContestants = async (existingContestants: FritzContestant[]) => {
    const positions = [1, 2, 3];
    const existingPositions = new Set(existingContestants?.map(c => c.position));
    
    for (const position of positions) {
      if (!existingPositions.has(position)) {
        const defaultName = DEFAULT_CONTESTANTS[position - 1];
        const { data: defaultContestant } = await supabase
          .from('fritz_default_contestants')
          .select('*')
          .eq('name', defaultName)
          .single();

        await supabase
          .from('fritz_contestants')
          .insert({
            position,
            score: 0,
            name: defaultName,
            image_url: defaultContestant?.image_url || null
          });
      }
    }

    const { data: finalContestants } = await supabase
      .from('fritz_contestants')
      .select('*')
      .order('position');

    setContestants(finalContestants || []);
  };

  const handleReset = async () => {
    await fetchContestants();
  };

  const updateContestant = async (position: number, name: string, imageUrl: string | null) => {
    console.log('updateContestant called with:', { position, name, imageUrl });
    
    const filledPositions = contestants.filter(c => c.name).length;
    const currentContestant = contestants.find(c => c.position === position);
    
    if (filledPositions === 3 && !currentContestant?.name) {
      toast({
        title: "All positions are full",
        description: "Clear a position before adding a new contestant",
        variant: "destructive"
      });
      return;
    }

    if (!position) {
      const emptyPosition = contestants.find(c => !c.name)?.position;
      if (!emptyPosition) {
        toast({
          title: "All positions are full",
          description: "Clear a position before adding a new contestant",
          variant: "destructive"
        });
        return;
      }
      position = emptyPosition;
    }

    const { data: defaultContestant, error: fetchError } = await supabase
      .from('fritz_default_contestants')
      .select('*')
      .eq('name', name)
      .single();

    if (fetchError) {
      console.error('Error fetching default contestant:', fetchError);
      return;
    }

    console.log('Found default contestant:', defaultContestant);

    const finalImageUrl = defaultContestant?.image_url || imageUrl;
    console.log('Using finalImageUrl:', finalImageUrl);

    const { error: updateError } = await supabase
      .from('fritz_contestants')
      .update({ 
        name,
        image_url: finalImageUrl,
        score: 0
      })
      .eq('position', position);

    if (updateError) {
      console.error('Error updating contestant:', updateError);
      toast({
        title: "Error",
        description: "Failed to update contestant",
        variant: "destructive"
      });
      return;
    }

    console.log('Database update successful');

    setContestants(prev => {
      const updated = prev.map(c => 
        c.position === position ? { 
          ...c, 
          name, 
          image_url: finalImageUrl, 
          score: 0 
        } : c
      );
      console.log('Updated contestants state:', updated);
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-transparent p-8">
      <div className="flex justify-between items-center mb-8">
        <ContestantSelector 
          onSelectContestant={(name, imageUrl) => {
            console.log('ContestantSelector selected:', { name, imageUrl });
            const nextEmptyPosition = contestants.findIndex(c => !c.name || c.name === 'Custom');
            if (nextEmptyPosition !== -1) {
              updateContestant(nextEmptyPosition + 1, name, imageUrl);
            }
          }} 
        />
        <Header onReset={handleReset} />
      </div>
      
      <FritzContestantManager 
        contestants={contestants}
        setContestants={setContestants}
      />
      
      <YearlyScores />
    </div>
  );
};

export default Fritz;