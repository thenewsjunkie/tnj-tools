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
  const currentYear = new Date().getFullYear();

  const updateScore = async (position: number, increment: boolean) => {
    const contestant = contestants.find(c => c.position === position);
    if (!contestant || !contestant.name) return;

    const newScore = increment ? (contestant.score || 0) + 1 : (contestant.score || 0) - 1;
    
    const { error } = await supabase
      .from('fritz_contestants')
      .update({ score: newScore })
      .eq('position', position);

    if (error) {
      console.error('Error updating score:', error);
      return;
    }

    // Update yearly score
    const { data: yearlyScore } = await supabase
      .from('fritz_yearly_scores')
      .select('total_score')
      .eq('contestant_name', contestant.name)
      .eq('year', currentYear)
      .single();

    if (yearlyScore) {
      const newYearlyScore = yearlyScore.total_score + (increment ? 1 : -1);
      await supabase
        .from('fritz_yearly_scores')
        .update({ total_score: newYearlyScore })
        .eq('contestant_name', contestant.name)
        .eq('year', currentYear);
    }

    setContestants(
      contestants.map(c => 
        c.position === position ? { ...c, score: newScore } : c
      )
    );
  };

  const clearContestant = async (position: number) => {
    const contestant = contestants.find(c => c.position === position);
    if (!contestant || !contestant.name) return;

    // First, delete any images associated with this position from storage
    if (contestant.image_url) {
      const imagePath = contestant.image_url.split('/').pop();
      if (imagePath) {
        const { error: storageError } = await supabase.storage
          .from('fritz_images')
          .remove([imagePath]);

        if (storageError) {
          console.error('Error removing image from storage:', storageError);
        }
      }
    }

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

    setContestants(
      contestants.map(c => 
        c.position === position ? { ...c, name: null, image_url: null, score: 0 } : c
      )
    );

    toast({
      title: "Contestant Cleared",
      description: `Position ${position} has been cleared`,
    });
  };

  const clearContestantImage = async (position: number) => {
    const contestant = contestants.find(c => c.position === position);
    if (!contestant || !contestant.image_url) return;

    // Delete the image from storage
    const imagePath = contestant.image_url.split('/').pop();
    if (imagePath) {
      const { error: storageError } = await supabase.storage
        .from('fritz_images')
        .remove([imagePath]);

      if (storageError) {
        console.error('Error removing image from storage:', storageError);
      }
    }

    const { error } = await supabase
      .from('fritz_contestants')
      .update({ image_url: null })
      .eq('position', position);

    if (error) {
      console.error('Error clearing contestant image:', error);
      return;
    }

    setContestants(
      contestants.map(c => 
        c.position === position ? { ...c, image_url: null } : c
      )
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

    setContestants(
      contestants.map(c => 
        c.position === position ? { ...c, image_url: publicUrl } : c
      )
    );
  };

  const updateContestantName = async (position: number, name: string) => {
    const { data: defaultContestant } = await supabase
      .from('fritz_default_contestants')
      .select('*')
      .eq('name', name)
      .single();

    const { error } = await supabase
      .from('fritz_contestants')
      .update({ 
        name,
        image_url: defaultContestant?.image_url || null,
        score: 0
      })
      .eq('position', position);

    if (error) {
      console.error('Error updating contestant:', error);
      return;
    }

    // Create or update yearly score entry
    const { data: yearlyScore } = await supabase
      .from('fritz_yearly_scores')
      .select('*')
      .eq('contestant_name', name)
      .eq('year', currentYear)
      .single();

    if (!yearlyScore) {
      await supabase
        .from('fritz_yearly_scores')
        .insert({
          contestant_name: name,
          total_score: 0,
          year: currentYear
        });
    }

    setContestants(
      contestants.map(c => 
        c.position === position ? { 
          ...c, 
          name, 
          image_url: defaultContestant?.image_url || null, 
          score: 0 
        } : c
      )
    );
  };

  return (
    <ContestantList
      contestants={contestants}
      onImageUpload={uploadImage}
      onNameChange={updateContestantName}
      onScoreChange={updateScore}
      onClear={clearContestant}
      onImageClear={clearContestantImage}
    />
  );
};

export default FritzContestantManager;