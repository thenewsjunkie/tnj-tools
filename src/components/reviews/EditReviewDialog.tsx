import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tv, Film, Utensils, Package, Skull, Zap, Rocket, Heart, Mountain, Trash2 } from "lucide-react";
import ReviewImageUpload from "./ReviewImageUpload";
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
  const [genre, setGenre] = useState(review.genre || undefined);
  const [rating, setRating] = useState(review.rating);
  const [content, setContent] = useState(review.content);
  const [imageUrls, setImageUrls] = useState<string[]>(review.image_urls || []);
  const { toast } = useToast();

  const genreOptions = [
    { value: 'Horror', icon: Skull },
    { value: 'Action', icon: Zap },
    { value: 'Sci Fi', icon: Rocket },
    { value: 'Romantic Comedy', icon: Heart },
    { value: 'Adventure', icon: Mountain },
    { value: 'Comedy', icon: Heart },
    { value: 'Drama', icon: Film },
    { value: 'Animation', icon: Film },
    { value: 'Thriller', icon: Skull },
    { value: 'Other', icon: Film },
  ];

  const handleDelete = async () => {
    try {
      const { error: deleteError } = await supabase
        .from('reviews')
        .delete()
        .eq('id', review.id);

      if (deleteError) throw deleteError;

      toast({
        title: "Success",
        description: "Review deleted successfully",
      });
      
      onReviewUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (type === 'movie' && !genre) {
      toast({
        title: "Error",
        description: "Please select a genre for the movie",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from('reviews')
        .update({
          title,
          type,
          rating,
          content,
          image_urls: imageUrls,
          genre: type === 'movie' ? genre : null,
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
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="dark:text-black">Edit Review</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select value={type} onValueChange={(value: ReviewType) => setType(value)}>
            <SelectTrigger className="bg-white dark:bg-white dark:text-black">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-white">
              <SelectItem value="television" className="text-black dark:text-black">
                <div className="flex items-center gap-2">
                  <Tv className="h-4 w-4" />
                  <span>Television Series</span>
                </div>
              </SelectItem>
              <SelectItem value="movie" className="text-black dark:text-black">
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4" />
                  <span>Movie</span>
                </div>
              </SelectItem>
              <SelectItem value="food" className="text-black dark:text-black">
                <div className="flex items-center gap-2">
                  <Utensils className="h-4 w-4" />
                  <span>Food</span>
                </div>
              </SelectItem>
              <SelectItem value="product" className="text-black dark:text-black">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>Product</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {type === 'movie' && (
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger className="bg-white dark:bg-white dark:text-black">
                <SelectValue placeholder="Select movie genre" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-white">
                {genreOptions.map(({ value, icon: Icon }) => (
                  <SelectItem key={value} value={value} className="text-black dark:text-black">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{value}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="bg-white dark:bg-white dark:text-black"
          />

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground dark:text-white">Rating</label>
            <Input
              type="number"
              min="1"
              max="5"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              required
              className="bg-white dark:bg-white dark:text-black"
            />
          </div>

          <Textarea
            placeholder="Review content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="min-h-[100px] bg-white dark:bg-white dark:text-black"
          />

          <ReviewImageUpload
            images={imageUrls}
            onImagesChange={setImageUrls}
            title={title}
          />

          <div className="flex gap-2">
            <Button type="submit" className="flex-1 light:text-black dark:text-black">
              Update Review
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={handleDelete}
              className="px-3"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditReviewDialog;