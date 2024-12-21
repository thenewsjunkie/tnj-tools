import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Zap, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Trigger {
  id: string;
  title: string;
  link: string;
}

const Companion = () => {
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newLink, setNewLink] = useState("");
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-foreground dark:text-white">Add New Trigger</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Trigger Title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    placeholder="Trigger Link"
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddTrigger} className="w-full">
                  Add Trigger
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {triggers.map((trigger) => (
          <Button
            key={trigger.id}
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleTriggerClick(trigger.link)}
          >
            {trigger.title}
          </Button>
        ))}
        {triggers.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-4">
            No triggers added yet
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Companion;