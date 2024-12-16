import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tv, Film, Utensils, Package, Edit2 } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import ImageFullscreen from "@/components/notes/ImageFullscreen";
import EditReviewDialog from "./EditReviewDialog";
import ReviewImageCarousel from "./ReviewImageCarousel";
import type { Review } from "./types";

interface ReviewDialogProps {
  review: Review | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReviewDialog = ({ review, open, onOpenChange }: ReviewDialogProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [objectFit, setObjectFit] = useState<'contain' | 'cover'>('contain');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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

            {review.image_urls?.length > 0 && (
              <ReviewImageCarousel
                images={review.image_urls}
                title={review.title}
                objectFit={objectFit}
                onToggleImageFit={toggleImageFit}
              />
            )}

            <p className="text-foreground">{review.content}</p>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Review: {reviewDate}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditDialogOpen(true)}
                className="hover:bg-accent"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isFullscreen && review.image_urls?.[selectedImageIndex] && (
        <ImageFullscreen
          url={review.image_urls[selectedImageIndex]}
          title={review.title}
          onClose={() => setIsFullscreen(false)}
        />
      )}

      <EditReviewDialog
        review={review}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onReviewUpdated={() => {
          setIsEditDialogOpen(false);
          onOpenChange(false);
          window.location.reload();
        }}
      />
    </>
  );
};

export default ReviewDialog;