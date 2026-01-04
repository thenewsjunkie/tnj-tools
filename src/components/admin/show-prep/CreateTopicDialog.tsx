import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DEFAULT_SHOW_HOURS } from "./types";

interface CreateTopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: {
    title: string;
    hourId: string;
    addToResources: boolean;
    removeFromHopper: boolean;
  }) => void;
  itemCount: number;
  isGroup: boolean;
  defaultTitle?: string;
}

const CreateTopicDialog = ({
  open,
  onOpenChange,
  onConfirm,
  itemCount,
  isGroup,
  defaultTitle = "",
}: CreateTopicDialogProps) => {
  const [title, setTitle] = useState(defaultTitle);
  const [hourId, setHourId] = useState(DEFAULT_SHOW_HOURS[0].id);
  const [addToResources, setAddToResources] = useState(isGroup);
  const [removeFromHopper, setRemoveFromHopper] = useState(true);

  // Update title when defaultTitle changes (e.g., when dialog opens with a group name)
  useEffect(() => {
    if (open && defaultTitle) {
      setTitle(defaultTitle);
    }
  }, [open, defaultTitle]);

  const handleConfirm = () => {
    if (!title.trim()) return;
    onConfirm({ title: title.trim(), hourId, addToResources, removeFromHopper });
    setTitle("");
    setHourId(DEFAULT_SHOW_HOURS[0].id);
    setAddToResources(false);
    setRemoveFromHopper(true);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTitle("");
      setHourId(DEFAULT_SHOW_HOURS[0].id);
      setAddToResources(false);
      setRemoveFromHopper(true);
    } else if (defaultTitle) {
      setTitle(defaultTitle);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Topic</DialogTitle>
          <DialogDescription>
            Create a new topic with {itemCount} {itemCount === 1 ? "link" : "links"} from the hopper.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="topic-title">Topic Title</Label>
            <Input
              id="topic-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter topic title..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && title.trim()) {
                  handleConfirm();
                }
              }}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="hour-select">Add to Hour</Label>
            <Select value={hourId} onValueChange={setHourId}>
              <SelectTrigger id="hour-select" className="text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEFAULT_SHOW_HOURS.map((hour) => (
                  <SelectItem key={hour.id} value={hour.id}>
                    {hour.label} ({hour.startTime} - {hour.endTime})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="add-resources"
              checked={addToResources}
              onCheckedChange={(checked) => setAddToResources(checked === true)}
            />
            <Label htmlFor="add-resources" className="text-sm font-normal cursor-pointer">
              Also add links to Resources page
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remove-hopper"
              checked={removeFromHopper}
              onCheckedChange={(checked) => setRemoveFromHopper(checked === true)}
            />
            <Label htmlFor="remove-hopper" className="text-sm font-normal cursor-pointer">
              Remove from Hopper after creating
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!title.trim()}>
            Create Topic
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTopicDialog;
