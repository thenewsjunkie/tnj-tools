import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { FritzContestant } from "@/integrations/supabase/types/tables/fritz";
import Header from "@/components/fritz/Header";
import ContestantSelector from "@/components/fritz/ContestantSelector";
import ContestantList from "@/components/fritz/ContestantList";

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

  const clearContestant = async (position: number) => {
    const { error } = await supabase
      .from('fritz_contestants')
      .update({ 
        name: null,
        image_url: null,
        score: 0
      })
      .eq('position', position);

    if (error) {
      console.error('Error clearing contestant:', error);
      return;
    }

    setContestants(prev => 
      prev.map(c => c.position === position ? { ...c, name: null, image_url: null, score: 0 } : c)
    );

    toast({
      title: "Contestant Cleared",
      description: `Position ${position} has been cleared`,
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
        <Header onReset={() => contestants.forEach(c => updateScore(c.position || 0, false))} />
      </div>
      
      <ContestantList
        contestants={contestants}
        onImageUpload={uploadImage}
        onNameChange={(position, name) => {
          const contestant = contestants.find(c => c.position === position);
          updateContestant(position, name, contestant?.image_url || null);
        }}
        onScoreChange={updateScore}
        onClear={clearContestant}
      />
    </div>
  );
};

export default Fritz;