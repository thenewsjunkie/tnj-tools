import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { FritzContestant } from "@/integrations/supabase/types/tables/fritz";
import Header from "@/components/fritz/Header";
import ContestantFrame from "@/components/fritz/ContestantFrame";
import ContestantSelector from "@/components/fritz/ContestantSelector";

const DEFAULT_CONTESTANTS = ['Shawn', 'Sabrina', 'C-Lane'];

const Fritz = () => {
  const [contestants, setContestants] = useState<FritzContestant[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchContestants();
  }, []);

  const fetchContestants = async () => {
    // First, try to get existing contestants
    const { data: existingContestants, error: fetchError } = await supabase
      .from('fritz_contestants')
      .select('*')
      .order('position');
    
    if (fetchError) {
      console.error('Error fetching contestants:', fetchError);
      return;
    }

    // If we don't have exactly 3 contestants, initialize with defaults
    if (!existingContestants || existingContestants.length < 3) {
      const positions = [1, 2, 3];
      const existingPositions = new Set(existingContestants?.map(c => c.position) || []);
      
      // Create missing contestants with default names
      for (const position of positions) {
        if (!existingPositions.has(position)) {
          const defaultName = DEFAULT_CONTESTANTS[position - 1];
          const { data: defaultContestant } = await supabase
            .from('fritz_default_contestants')
            .select('*')
            .eq('name', defaultName)
            .single();

          const { error: insertError } = await supabase
            .from('fritz_contestants')
            .insert({
              position,
              score: 0,
              name: defaultName,
              image_url: defaultContestant?.image_url || null
            });

          if (insertError) {
            console.error(`Error creating contestant for position ${position}:`, insertError);
          }
        }
      }

      // Fetch all contestants again after initialization
      const { data: finalContestants, error: finalError } = await supabase
        .from('fritz_contestants')
        .select('*')
        .order('position');

      if (finalError) {
        console.error('Error fetching final contestants:', finalError);
        return;
      }

      setContestants(finalContestants || []);
    } else {
      setContestants(existingContestants);
    }
  };

  const updateScore = async (position: number, increment: boolean) => {
    const contestant = contestants.find(c => c.position === position);
    if (!contestant) return;

    const newScore = increment ? (contestant.score || 0) + 1 : (contestant.score || 0) - 1;
    
    const { error } = await supabase
      .from('fritz_contestants')
      .update({ score: newScore })
      .eq('position', position);

    if (error) {
      console.error('Error updating score:', error);
      return;
    }

    setContestants(prev => 
      prev.map(c => c.position === position ? { ...c, score: newScore } : c)
    );
  };

  const resetScores = async () => {
    const { error } = await supabase
      .from('fritz_contestants')
      .update({ score: 0 })
      .in('position', [1, 2, 3]);

    if (error) {
      console.error('Error resetting scores:', error);
      return;
    }

    setContestants(prev => prev.map(c => ({ ...c, score: 0 })));
    toast({
      title: "Scores Reset",
      description: "All scores have been reset to 0",
    });
  };

  const updateContestant = async (position: number, name: string, imageUrl: string | null) => {
    const { error } = await supabase
      .from('fritz_contestants')
      .update({ 
        name,
        image_url: imageUrl
      })
      .eq('position', position);

    if (error) {
      console.error('Error updating contestant:', error);
      toast({
        title: "Error",
        description: "Failed to update contestant",
        variant: "destructive"
      });
      return;
    }

    setContestants(prev => 
      prev.map(c => c.position === position ? { ...c, name, image_url: imageUrl } : c)
    );
  };

  const uploadImage = async (position: number, file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${position}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('fritz_images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('fritz_images')
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from('fritz_contestants')
      .update({ image_url: publicUrl })
      .eq('position', position);

    if (updateError) {
      console.error('Error updating image URL:', updateError);
      return;
    }

    setContestants(prev => 
      prev.map(c => c.position === position ? { ...c, image_url: publicUrl } : c)
    );
  };

  return (
    <div className="min-h-screen bg-transparent p-8">
      <div className="flex justify-between items-center mb-8">
        <ContestantSelector 
          onSelectContestant={(name, imageUrl) => {
            const nextEmptyPosition = contestants.findIndex(c => !c.name || c.name === 'Custom');
            if (nextEmptyPosition !== -1) {
              updateContestant(nextEmptyPosition + 1, name, imageUrl);
            }
          }} 
        />
        <Header onReset={resetScores} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              onImageUpload={(file) => uploadImage(position, file)}
              onNameChange={(name) => updateContestant(position, name, contestant.image_url)}
              onScoreChange={(increment) => updateScore(position, increment)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Fritz;