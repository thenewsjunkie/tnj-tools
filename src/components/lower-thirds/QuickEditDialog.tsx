import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
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
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (lowerThird) {
      setPrimaryText(lowerThird.primary_text || "");
      setSecondaryText(lowerThird.secondary_text || "");
      setTickerText(lowerThird.ticker_text || "");
    }
  }, [lowerThird]);

  const handleImageUpload = async (file: File) => {
    if (!lowerThird) return;

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('show_notes_images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('show_notes_images')
        .getPublicUrl(fileName);

      // Delete old image if it exists
      if (lowerThird.guest_image_url) {
        const oldFileName = lowerThird.guest_image_url.split('/').pop();
        if (oldFileName) {
          await supabase.storage
            .from('show_notes_images')
            .remove([oldFileName]);
        }
      }

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lowerThird) return;

    try {
      let guestImageUrl = lowerThird.guest_image_url;
      const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
      const file = fileInput?.files?.[0];

      if (file) {
        guestImageUrl = await handleImageUpload(file);
      }

      const { error } = await supabase
        .from("lower_thirds")
        .update({
          primary_text: primaryText,
          secondary_text: secondaryText,
          ticker_text: tickerText,
          guest_image_url: guestImageUrl,
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
          {lowerThird?.type === "guest" && (
            <div className="space-y-2">
              <Label>Guest Photo</Label>
              <Input
                type="file"
                accept="image/*"
                disabled={isUploading}
              />
              {lowerThird.guest_image_url && (
                <div className="mt-2">
                  <img 
                    src={lowerThird.guest_image_url} 
                    alt="Current guest" 
                    className="w-20 h-20 object-cover rounded"
                  />
                </div>
              )}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isUploading}>
            {isUploading ? "Uploading..." : "Update"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuickEditDialog;