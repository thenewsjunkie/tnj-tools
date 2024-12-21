import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, Plus } from "lucide-react";
import TriggerButton from "./triggers/TriggerButton";
import TriggerDialog from "./triggers/TriggerDialog";
import { useTriggers, type Trigger } from "@/hooks/useTriggers";

const Companion = () => {
  const { triggers, addTrigger, editTrigger, deleteTrigger, executeTrigger } = useTriggers();
  const [editingTrigger, setEditingTrigger] = useState<Trigger | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = async (title: string, link: string) => {
    let success;
    if (editingTrigger) {
      success = await editTrigger({ ...editingTrigger, title, link });
    } else {
      success = await addTrigger(title, link);
    }
    
    if (success) {
      setEditingTrigger(null);
      setIsDialogOpen(false);
    }
  };

  const openEditDialog = (trigger: Trigger) => {
    setEditingTrigger(trigger);
    setIsDialogOpen(true);
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
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  setEditingTrigger(null);
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <TriggerDialog
              trigger={editingTrigger}
              onSubmit={handleSubmit}
            />
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {triggers.map((trigger) => (
            <TriggerButton
              key={trigger.id}
              title={trigger.title}
              onTriggerClick={() => executeTrigger(trigger.link)}
              onEdit={() => openEditDialog(trigger)}
              onDelete={() => deleteTrigger(trigger.id)}
            />
          ))}
        </div>
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