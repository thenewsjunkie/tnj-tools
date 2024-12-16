import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tv, Film, Utensils, Package } from "lucide-react";
import type { Review, ReviewType } from "./types";

interface EditReviewDialogProps {
  review: Review;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReviewUpdated: () => void;
}

const EditReviewDialog = ({ review, open, onOpenChange, onReviewUpdated }: EditReviewDialogProps) => {
  const [title, setTitle] = useState(review.title);
  const [type, setType] = useState<ReviewType>(review.type);
  const [rating, setRating] = useState(review.rating);
  const [content, setContent] = useState(review.content);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
    const file = fileInput?.files?.[0];

    setIsUploading(true);
    try {
      let imageUrl = review.image_url;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('show_notes_images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage
          .from('show_notes_images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl.publicUrl;

        // Delete old image if it exists
        if (review.image_url) {
          const oldFileName = review.image_url.split('/').pop();
          if (oldFileName) {
            await supabase.storage
              .from('show_notes_images')
              .remove([oldFileName]);
          }
        }
      }

      const { error: updateError } = await supabase
        .from('reviews')
        .update({
          title,
          type,
          rating,
          content,
          image_url: imageUrl,
        })
        .eq('id', review.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Review updated successfully",
      });
      
      onReviewUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Error",
        description: "Failed to update review",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <DialogHeader>
          <DialogTitle>Edit Review</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select value={type} onValueChange={(value: ReviewType) => setType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="television" className="flex items-center gap-2">
                <Tv className="h-4 w-4" />
                <span>Television Series</span>
              </SelectItem>
              <SelectItem value="movie" className="flex items-center gap-2">
                <Film className="h-4 w-4" />
                <span>Movie</span>
              </SelectItem>
              <SelectItem value="food" className="flex items-center gap-2">
                <Utensils className="h-4 w-4" />
                <span>Food</span>
              </SelectItem>
              <SelectItem value="product" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>Product</span>
              </SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Rating</label>
            <Input
              type="number"
              min="1"
              max="5"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              required
            />
          </div>

          <Textarea
            placeholder="Review content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="min-h-[100px]"
          />

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Image (optional)</label>
            <Input
              type="file"
              accept="image/*"
            />
            <p className="text-xs text-muted-foreground">Leave empty to keep current image</p>
          </div>

          <Button type="submit" className="w-full" disabled={isUploading}>
            {isUploading ? "Updating..." : "Update Review"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditReviewDialog;