import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TriggerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onTitleChange: (value: string) => void;
  link: string;
  onLinkChange: (value: string) => void;
  onSave: () => void;
  mode: "add" | "edit";
}

export const TriggerDialog = ({
  isOpen,
  onOpenChange,
  title,
  onTitleChange,
  link,
  onLinkChange,
  onSave,
  mode
}: TriggerDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-foreground dark:text-white">
            {mode === "edit" ? "Edit Trigger" : "Add New Trigger"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Input
              placeholder="Trigger Title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Input
              placeholder="Trigger Link"
              value={link}
              onChange={(e) => onLinkChange(e.target.value)}
            />
          </div>
          <Button onClick={onSave} className="w-full">
            {mode === "edit" ? "Update Trigger" : "Add Trigger"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};