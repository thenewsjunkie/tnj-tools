import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useProfileStatus = () => {
  const [isApproved, setIsApproved] = useState<boolean | null>(null);

  const checkApprovalStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found, create one
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: userId,
                status: 'pending',
                timezone: 'UTC'
              }
            ]);
          
          if (insertError) {
            console.error("Error creating profile:", insertError);
            return;
          }
          
          setIsApproved(false);
          return;
        }
        
        console.error("Error checking approval status:", error);
        return;
      }

      setIsApproved(data?.status === "approved");
    } catch (error) {
      console.error("Error in checkApprovalStatus:", error);
    }
  };

  return { isApproved, setIsApproved, checkApprovalStatus };
};