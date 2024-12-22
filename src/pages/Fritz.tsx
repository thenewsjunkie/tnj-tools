import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { FritzContestant } from "@/integrations/supabase/types/tables/fritz";
import Header from "@/components/fritz/Header";
import ContestantFrame from "@/components/fritz/ContestantFrame";

const Fritz = () => {
  const [contestants, setContestants] = useState<FritzContestant[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchContestants();
  }, []);

  const fetchContestants = async () => {
    const { data, error } = await supabase
      .from('fritz_contestants')
      .select('*')
      .order('position');
    
    if (error) {
      console.error('Error fetching contestants:', error);
      return;
    }

    setContestants(data || []);
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

    // Only update scores in the state, preserve names and images
    setContestants(prev => prev.map(c => ({ ...c, score: 0 })));
    toast({
      title: "Scores Reset",
      description: "All scores have been reset to 0",
    });
  };

  const updateName = async (position: number, name: string) => {
    const contestant = contestants.find(c => c.position === position);
    if (!contestant) return;

    const { error } = await supabase
      .from('fritz_contestants')
      .upsert({ 
        id: contestant.id || undefined,
        position,
        name,
        score: contestant.score || 0,
        image_url: contestant.image_url
      });

    if (error) {
      console.error('Error updating name:', error);
      toast({
        title: "Error",
        description: "Failed to update contestant name",
        variant: "destructive"
      });
      return;
    }

    setContestants(prev => 
      prev.map(c => c.position === position ? { ...c, name } : c)
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

    const contestant = contestants.find(c => c.position === position);
    const { error: updateError } = await supabase
      .from('fritz_contestants')
      .upsert({ 
        id: contestant?.id || undefined,
        position,
        name: contestant?.name || '',
        score: contestant?.score || 0,
        image_url: publicUrl
      });

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
      <Header onReset={resetScores} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((position) => {
          const contestant = contestants.find(c => c.position === position) || {
            id: `temp-${position}`,
            name: '',
            score: 0,
            image_url: '',
            position
          };

          return (
            <ContestantFrame
              key={position}
              imageUrl={contestant.image_url}
              name={contestant.name}
              score={contestant.score || 0}
              onImageUpload={(file) => uploadImage(position, file)}
              onNameChange={(name) => updateName(position, name)}
              onScoreChange={(increment) => updateScore(position, increment)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Fritz;