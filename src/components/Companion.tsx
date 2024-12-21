import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Zap, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TriggerDialog } from "./triggers/TriggerDialog";
import { TriggerGrid } from "./triggers/TriggerGrid";

interface Trigger {
  id: string;
  title: string;
  link: string;
}

const Companion = () => {
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newLink, setNewLink] = useState("");
  const [editingTrigger, setEditingTrigger] = useState<Trigger | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTriggers();
  }, []);

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

  const handleAddTrigger = async () => {
    if (!newTitle || !newLink) {
      toast({
        title: "Error",
        description: "Both title and link are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('triggers')
        .insert([{ title: newTitle, link: newLink }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Trigger added successfully",
      });

      setNewTitle("");
      setNewLink("");
      setIsDialogOpen(false);
      fetchTriggers();
    } catch (error) {
      console.error('Error adding trigger:', error);
      toast({
        title: "Error",
        description: "Failed to add trigger",
        variant: "destructive",
      });
    }
  };

  const handleEditTrigger = async () => {
    if (!editingTrigger || !editingTrigger.title || !editingTrigger.link) {
      toast({
        title: "Error",
        description: "Both title and link are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('triggers')
        .update({ 
          title: editingTrigger.title, 
          link: editingTrigger.link 
        })
        .eq('id', editingTrigger.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Trigger updated successfully",
      });

      setEditingTrigger(null);
      setIsDialogOpen(false);
      fetchTriggers();
    } catch (error) {
      console.error('Error updating trigger:', error);
      toast({
        title: "Error",
        description: "Failed to update trigger",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTrigger = async (id: string) => {
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
    } catch (error) {
      console.error('Error deleting trigger:', error);
      toast({
        title: "Error",
        description: "Failed to delete trigger",
        variant: "destructive",
      });
    }
  };

  const handleTriggerClick = async (link: string) => {
    try {
      await fetch(link);
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

  return (
    <Card className="w-full bg-background border border-gray-200 dark:border-white/10">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-foreground" />
            Triggers
          </div>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                setEditingTrigger(null);
                setNewTitle("");
                setNewLink("");
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TriggerGrid
          triggers={triggers}
          onTriggerClick={handleTriggerClick}
          onEditClick={(trigger) => {
            setEditingTrigger(trigger);
            setIsDialogOpen(true);
          }}
          onDeleteClick={handleDeleteTrigger}
        />
        <TriggerDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={editingTrigger ? editingTrigger.title : newTitle}
          onTitleChange={(value) => 
            editingTrigger 
              ? setEditingTrigger({...editingTrigger, title: value})
              : setNewTitle(value)
          }
          link={editingTrigger ? editingTrigger.link : newLink}
          onLinkChange={(value) => 
            editingTrigger
              ? setEditingTrigger({...editingTrigger, link: value})
              : setNewLink(value)
          }
          onSave={editingTrigger ? handleEditTrigger : handleAddTrigger}
          mode={editingTrigger ? "edit" : "add"}
        />
      </CardContent>
    </Card>
  );
};

export default Companion;