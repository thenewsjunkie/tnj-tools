import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReviewImageUpload from "./ReviewImageUpload";
import ReviewTypeSelect from "./ReviewTypeSelect";
import MovieGenreSelect from "./MovieGenreSelect";
import RatingSelect from "./RatingSelect";
import type { ReviewType } from "./types";

interface AddReviewDialogProps {
  onReviewAdded: () => void;
}

const AddReviewDialog = ({ onReviewAdded }: AddReviewDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ReviewType>();
  const [genre, setGenre] = useState<string>();
  const [rating, setRating] = useState<number>();
  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !rating || !title || !content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (type === 'movie' && !genre) {
      toast({
        title: "Error",
        description: "Please select a genre for the movie",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          type,
          title,
          rating,
          content,
          image_urls: imageUrls,
          genre: type === 'movie' ? genre : null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Review added successfully",
      });

      setOpen(false);
      setTitle("");
      setType(undefined);
      setGenre(undefined);
      setRating(undefined);
      setContent("");
      setImageUrls([]);
      onReviewAdded();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add review",
        variant: "destructive",
      });
    }
  };

  const remainingChars = 140 - content.length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm"
          className="bg-neon-red text-white border-2 border-tnj-dark hover:bg-neon-red"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Review
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Review</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <ReviewTypeSelect onValueChange={setType} />

          {type === 'movie' && (
            <MovieGenreSelect onValueChange={setGenre} />
          )}

          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-foreground"
          />

          <RatingSelect onValueChange={setRating} />

          <ReviewImageUpload
            images={imageUrls}
            onImagesChange={setImageUrls}
            title={title}
          />

          <div>
            <Textarea
              placeholder="Write your review..."
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 140))}
              className="text-foreground"
            />
            <p className="text-sm text-muted-foreground mt-1">
              {remainingChars} characters remaining
            </p>
          </div>

          <Button type="submit" className="w-full text-black">
            Add Review
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddReviewDialog;