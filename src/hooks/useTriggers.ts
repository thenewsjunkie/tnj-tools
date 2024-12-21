import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface Trigger {
  id: string;
  title: string;
  link: string;
}

export const useTriggers = () => {
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const { toast } = useToast();

  const fetchTriggers = async () => {
    try {
      const { data, error } = await supabase
        .from('triggers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTriggers(data || []);
    } catch (error) {
      console.error('Error fetching triggers:', error);
      toast({
        title: "Error",
        description: "Failed to load triggers",
        variant: "destructive",
      });
    }
  };

  const addTrigger = async (title: string, link: string) => {
    try {
      const { error } = await supabase
        .from('triggers')
        .insert([{ title, link }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Trigger added successfully",
      });
      
      fetchTriggers();
      return true;
    } catch (error) {
      console.error('Error adding trigger:', error);
      toast({
        title: "Error",
        description: "Failed to add trigger",
        variant: "destructive",
      });
      return false;
    }
  };

  const editTrigger = async (trigger: Trigger) => {
    try {
      const { error } = await supabase
        .from('triggers')
        .update({ title: trigger.title, link: trigger.link })
        .eq('id', trigger.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Trigger updated successfully",
      });
      
      fetchTriggers();
      return true;
    } catch (error) {
      console.error('Error updating trigger:', error);
      toast({
        title: "Error",
        description: "Failed to update trigger",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteTrigger = async (id: string) => {
    try {
      const { error } = await supabase
        .from('triggers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Trigger deleted successfully",
      });
      
      fetchTriggers();
      return true;
    } catch (error) {
      console.error('Error deleting trigger:', error);
      toast({
        title: "Error",
        description: "Failed to delete trigger",
        variant: "destructive",
      });
      return false;
    }
  };

  const executeTrigger = async (link: string) => {
    console.log('Companion: Trigger clicked with link:', link);
    try {
      console.log('Companion: Attempting to fetch:', link);
      const response = await fetch(link, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Companion: Fetch response:', response);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      toast({
        title: "Success",
        description: "Trigger executed successfully",
      });
    } catch (error) {
      console.error('Error executing trigger:', error);
      toast({
        title: "Error",
        description: "Failed to execute trigger",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTriggers();
  }, []);

  return {
    triggers,
    addTrigger,
    editTrigger,
    deleteTrigger,
    executeTrigger
  };
};