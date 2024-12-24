import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

interface QuickEditDialogProps {
  lowerThird: Tables<"lower_thirds"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QuickEditDialog = ({ lowerThird, open, onOpenChange }: QuickEditDialogProps) => {
  const [primaryText, setPrimaryText] = useState("");
  const [secondaryText, setSecondaryText] = useState("");
  const [tickerText, setTickerText] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (lowerThird) {
      setPrimaryText(lowerThird.primary_text || "");
      setSecondaryText(lowerThird.secondary_text || "");
      setTickerText(lowerThird.ticker_text || "");
    }
  }, [lowerThird]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lowerThird) return;

    try {
      const { error } = await supabase
        .from("lower_thirds")
        .update({
          primary_text: primaryText,
          secondary_text: secondaryText,
          ticker_text: tickerText,
        })
        .eq("id", lowerThird.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Lower third updated successfully",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: "Failed to update lower third",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Quick Edit Lower Third</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              placeholder="Primary Text"
              value={primaryText}
              onChange={(e) => setPrimaryText(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Input
              placeholder="Secondary Text"
              value={secondaryText}
              onChange={(e) => setSecondaryText(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Input
              placeholder="Ticker Text"
              value={tickerText}
              onChange={(e) => setTickerText(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">Update</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuickEditDialog;