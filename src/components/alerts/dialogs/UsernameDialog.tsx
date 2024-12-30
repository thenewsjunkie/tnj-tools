import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface UsernameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (username: string, giftCount?: number) => void;
  isGiftAlert?: boolean;
}

const UsernameDialog = ({ open, onOpenChange, onSubmit, isGiftAlert }: UsernameDialogProps) => {
  const [username, setUsername] = useState("");
  const [giftCount, setGiftCount] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(username, isGiftAlert ? giftCount : undefined);
    setUsername("");
    setGiftCount(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-foreground">Enter Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="text-foreground bg-background"
            />
          </div>
          
          {isGiftAlert && (
            <div className="space-y-2">
              <Label htmlFor="giftCount">Number of Subscriptions</Label>
              <Input
                id="giftCount"
                type="number"
                min="1"
                value={giftCount}
                onChange={(e) => setGiftCount(parseInt(e.target.value) || 1)}
                required
                className="text-foreground bg-background"
              />
            </div>
          )}
          
          <Button type="submit" className="w-full text-black dark:text-black">
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UsernameDialog;