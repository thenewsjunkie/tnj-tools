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
    console.log('Clearing contestant at position:', position);
    const contestant = contestants.find(c => c.position === position);
    console.log('Found contestant:', contestant);
    
    if (!contestant || !contestant.name) {
      console.log('No contestant found or no name, returning early');
      return;
    }

    // First, delete any images associated with this position from storage
    if (contestant.image_url) {
      console.log('Attempting to delete image:', contestant.image_url);
      const imagePath = contestant.image_url.split('/').pop();
      console.log('Extracted image path:', imagePath);
      
      if (imagePath) {
        const { error: storageError } = await supabase.storage
          .from('fritz_images')
          .remove([imagePath]);

        if (storageError) {
          console.error('Error removing image from storage:', storageError);
        } else {
          console.log('Successfully deleted image from storage');
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

    console.log('Successfully cleared contestant in database');

    setContestants(
      contestants.map(c => 
        c.position === position ? { ...c, name: null, image_url: null, score: 0 } : c
      )
    );

    console.log('Updated contestants state');

    toast({
      title: "Contestant Cleared",
      description: `Position ${position} has been cleared`,
    });
  };

  const clearContestantImage = async (position: number) => {
    console.log('Clearing image for position:', position);
    const contestant = contestants.find(c => c.position === position);
    console.log('Found contestant:', contestant);
    
    if (!contestant || !contestant.image_url) {
      console.log('No contestant found or no image URL, returning early');
      return;
    }

    // Delete the image from storage
    const imagePath = contestant.image_url.split('/').pop();
    console.log('Extracted image path:', imagePath);
    
    if (imagePath) {
      const { error: storageError } = await supabase.storage
        .from('fritz_images')
        .remove([imagePath]);

      if (storageError) {
        console.error('Error removing image from storage:', storageError);
      } else {
        console.log('Successfully deleted image from storage');
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

    console.log('Successfully cleared image URL in database');

    setContestants(
      contestants.map(c => 
        c.position === position ? { ...c, image_url: null } : c
      )
    );

    console.log('Updated contestants state');
  };

  const uploadImage = async (position: number, file: File) => {
    console.log('Uploading image for position:', position);
    console.log('File:', file.name, file.type, file.size);

    const fileExt = file.name.split('.').pop();
    const fileName = `${position}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    console.log('Generated file path:', filePath);

    const { error: uploadError } = await supabase.storage
      .from('fritz_images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return;
    }

    console.log('Successfully uploaded image to storage');

    const { data: { publicUrl } } = supabase.storage
      .from('fritz_images')
      .getPublicUrl(filePath);

    console.log('Generated public URL:', publicUrl);

    const { error: updateError } = await supabase
      .from('fritz_contestants')
      .update({ image_url: publicUrl })
      .eq('position', position);

    if (updateError) {
      console.error('Error updating image URL:', updateError);
      return;
    }

    console.log('Successfully updated image URL in database');

    setContestants(
      contestants.map(c => 
        c.position === position ? { ...c, image_url: publicUrl } : c
      )
    );

    console.log('Updated contestants state');
  };

  const updateContestantName = async (position: number, name: string) => {
    console.log('Updating contestant name:', { position, name });
    
    const { data: defaultContestant } = await supabase
      .from('fritz_default_contestants')
      .select('*')
      .eq('name', name)
      .single();

    console.log('Found default contestant:', defaultContestant);

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

    console.log('Successfully updated contestant in database');

    // Create or update yearly score entry
    const { data: yearlyScore } = await supabase
      .from('fritz_yearly_scores')
      .select('*')
      .eq('contestant_name', name)
      .eq('year', currentYear)
      .single();

    console.log('Found yearly score:', yearlyScore);

    if (!yearlyScore) {
      await supabase
        .from('fritz_yearly_scores')
        .insert({
          contestant_name: name,
          total_score: 0,
          year: currentYear
        });
      console.log('Created new yearly score entry');
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

    console.log('Updated contestants state');
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