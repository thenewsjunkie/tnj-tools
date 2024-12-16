import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tv, Film, Utensils, Package, Maximize2 } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import ImageFullscreen from "@/components/notes/ImageFullscreen";
import type { Review } from "./types";

interface ReviewDialogProps {
  review: Review | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReviewDialog = ({ review, open, onOpenChange }: ReviewDialogProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [objectFit, setObjectFit] = useState<'cover' | 'contain'>('cover');

  if (!review) return null;

  const icons = {
    television: Tv,
    movie: Film,
    food: Utensils,
    product: Package,
  };

  const Icon = icons[review.type];
  const reviewDate = format(new Date(review.created_at), "EEEE, MMMM d");

  const toggleImageFit = () => {
    setObjectFit(prev => prev === 'cover' ? 'contain' : 'cover');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="dark:bg-background/95 dark:backdrop-blur dark:supports-[backdrop-filter]:bg-background/60 bg-white max-h-[90vh] overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-foreground" />
              <h2 className="text-xl font-semibold text-foreground">{review.title}</h2>
            </div>
            
            <div className="text-xl text-yellow-500">
              {"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}
            </div>

            {review.image_url && (
              <div className="relative">
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={review.image_url} 
                    alt={review.title}
                    className={`rounded-md w-full h-full ${objectFit === 'cover' ? 'object-cover' : 'object-contain'}`}
                  />
                </div>
                <div className="absolute top-2 right-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="bg-black/50 hover:bg-black/70"
                    onClick={toggleImageFit}
                  >
                    <Maximize2 className="h-4 w-4 text-white" />
                  </Button>
                </div>
              </div>
            )}

            <p className="text-foreground">{review.content}</p>
            
            <div className="text-sm text-muted-foreground">
              Review: {reviewDate}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isFullscreen && review.image_url && (
        <ImageFullscreen
          url={review.image_url}
          title={review.title}
          onClose={() => setIsFullscreen(false)}
        />
      )}
    </>
  );
};

export default ReviewDialog;