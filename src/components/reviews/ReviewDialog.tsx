import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tv, Film, Utensils, Package } from "lucide-react";
import { format } from "date-fns";
import type { Review } from "./types";

interface ReviewDialogProps {
  review: Review | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReviewDialog = ({ review, open, onOpenChange }: ReviewDialogProps) => {
  if (!review) return null;

  const icons = {
    television: Tv,
    movie: Film,
    food: Utensils,
    product: Package,
  };

  const Icon = icons[review.type];
  const reviewDate = format(new Date(review.created_at), "EEEE, MMMM d");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dark:bg-background/95 dark:backdrop-blur dark:supports-[backdrop-filter]:bg-background/60 bg-white">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-foreground" />
            <h2 className="text-xl font-semibold text-foreground">{review.title}</h2>
          </div>
          
          <div className="text-xl text-yellow-500">
            {"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}
          </div>

          {review.image_url && (
            <div className="relative aspect-video">
              <img 
                src={review.image_url} 
                alt={review.title}
                className="rounded-md object-cover w-full h-full"
              />
            </div>
          )}

          <p className="text-foreground">{review.content}</p>
          
          <div className="text-sm text-muted-foreground">
            Review: {reviewDate}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;