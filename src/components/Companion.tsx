import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Zap, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Trigger {
  title: string;
  link: string;
}

const Companion = () => {
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newLink, setNewLink] = useState("");
  const { toast } = useToast();

  const handleAddTrigger = () => {
    if (!newTitle || !newLink) {
      toast({
        title: "Error",
        description: "Both title and link are required",
        variant: "destructive",
      });
      return;
    }

    setTriggers([...triggers, { title: newTitle, link: newLink }]);
    setNewTitle("");
    setNewLink("");
  };

  const handleTriggerClick = async (link: string) => {
    try {
      await fetch(link);
      toast({
        title: "Success",
        description: "Trigger executed successfully",
      });
    } catch (error) {
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
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Trigger</DialogTitle>
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
        {triggers.map((trigger, index) => (
          <Button
            key={index}
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