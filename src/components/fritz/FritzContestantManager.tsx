import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { FritzContestant } from "@/integrations/supabase/types/tables/fritz";
import ContestantList from "./ContestantList";

interface FritzContestantManagerProps {
  contestants: FritzContestant[];
  setContestants: (contestants: FritzContestant[]) => void;
}

const FritzContestantManager = ({ contestants, setContestants }: FritzContestantManagerProps) => {
  const { toast } = useToast();

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

  const clearContestantImage = async (position: number) => {
    const { error } = await supabase
      .from('fritz_contestants')
      .update({ image_url: null })
      .eq('position', position);

    if (error) {
      console.error('Error clearing contestant image:', error);
      return;
    }

    setContestants(prev => 
      prev.map(c => c.position === position ? { ...c, image_url: null } : c)
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
    <ContestantList
      contestants={contestants}
      onImageUpload={uploadImage}
      onNameChange={(position, name) => {
        const contestant = contestants.find(c => c.position === position);
        updateContestant(position, name, contestant?.image_url || null);
      }}
      onScoreChange={updateScore}
      onClear={clearContestant}
      onImageClear={clearContestantImage}
    />
  );
};

export default FritzContestantManager;