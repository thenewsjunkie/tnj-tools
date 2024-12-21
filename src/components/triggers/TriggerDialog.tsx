import { useState, useEffect } from "react";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Trigger } from "@/hooks/useTriggers";

interface TriggerDialogProps {
  trigger?: Trigger;
  onSubmit: (title: string, link: string) => void;
}

const TriggerDialog = ({ trigger, onSubmit }: TriggerDialogProps) => {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");

  useEffect(() => {
    if (trigger) {
      setTitle(trigger.title);
      setLink(trigger.link);
    } else {
      setTitle("");
      setLink("");
    }
  }, [trigger]);

  const handleSubmit = () => {
    onSubmit(title, link);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="text-foreground dark:text-white">
          {trigger ? 'Edit Trigger' : 'Add New Trigger'}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 pt-4">
        <div className="space-y-2">
          <Input
            placeholder="Trigger Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Input
            placeholder="Trigger Link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </div>
        <Button 
          onClick={handleSubmit}
          className="w-full"
        >
          {trigger ? 'Update Trigger' : 'Add Trigger'}
        </Button>
      </div>
    </DialogContent>
  );
};

export default TriggerDialog;