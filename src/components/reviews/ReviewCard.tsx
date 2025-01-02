import { LucideIcon, Eye } from "lucide-react";
import type { Review } from "./types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Json } from "@/integrations/supabase/types";
import ReviewNavigationControls from "./ReviewNavigationControls";
import ReviewStreamControl from "./ReviewStreamControl";

interface ReviewCardProps {
  review: Review;
  onClick: () => void;
  Icon: LucideIcon;
  simpleView?: boolean;
}

const ReviewCard = ({ review, onClick, Icon, simpleView = false }: ReviewCardProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: activeReview } = useQuery({
    queryKey: ['active-review'],
    queryFn: async () => {
      const { data: settings } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'active_review')
        .single();
      
      const value = settings?.value as { review_id: string | null, current_image_index?: number } | null;
      return value ?? null;
    },
  });

  const isActive = activeReview?.review_id === review.id;
  const currentImageIndex = activeReview?.current_image_index ?? 0;
  const hasMultipleImages = review.image_urls && review.image_urls.length > 1;

  const updateActiveReview = async (reviewId: string | null, imageIndex?: number) => {
    try {
      const value = reviewId ? { 
        review_id: reviewId,
        current_image_index: imageIndex ?? 0
      } : { review_id: null };
      
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key: 'active_review',
          value: value as unknown as Json,
        });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['active-review'] });
    } catch (error) {
      console.error('Error updating active review:', error);
      toast({
        title: "Error updating stream",
        variant: "destructive",
      });
    }
  };

  const toggleReviewStream = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (isActive) {
        await updateActiveReview(null);
        toast({
          title: "Review removed from stream",
          duration: 2000,
        });
      } else {
        await updateActiveReview(review.id, 0);
        toast({
          title: "Review added to stream",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error toggling review stream:', error);
      toast({
        title: "Error updating stream",
        variant: "destructive",
      });
    }
  };

  const navigateImages = async (direction: 'prev' | 'next') => {
    if (!review.image_urls?.length) return;
    
    const newIndex = direction === 'next'
      ? (currentImageIndex + 1) % review.image_urls.length
      : (currentImageIndex - 1 + review.image_urls.length) % review.image_urls.length;
    
    await updateActiveReview(review.id, newIndex);
    
    toast({
      title: `Showing image ${newIndex + 1} of ${review.image_urls.length}`,
      duration: 1000,
    });
  };

  if (simpleView) {
    return (
      <div
        onClick={onClick}
        className="flex items-center justify-between p-2 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-accent cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Icon className="h-4 w-4 text-foreground flex-shrink-0" />
          <h3 className="font-medium text-sm text-foreground truncate">{review.title}</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-yellow-500 text-sm flex-shrink-0">
            {"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}
          </div>
          <div className="flex items-center gap-2">
            {isActive && hasMultipleImages && (
              <ReviewNavigationControls onNavigate={navigateImages} />
            )}
            <ReviewStreamControl isActive={isActive} onToggle={toggleReviewStream} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="flex flex-col gap-2 p-3 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-accent cursor-pointer transition-colors relative group"
    >
      <div className="flex items-center justify-between min-w-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Icon className="h-4 w-4 text-foreground flex-shrink-0" />
          <h3 className="font-medium text-sm text-foreground truncate">{review.title}</h3>
        </div>
      </div>
      
      {review.image_urls && review.image_urls.length > 0 && (
        <div className="relative w-full">
          <img 
            src={review.image_urls[0]} 
            alt={review.title}
            className="rounded-md w-full h-auto object-contain max-h-40"
          />
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground line-clamp-2">
          {review.content}
        </p>
        <div className="flex flex-col items-end gap-2">
          <div className="text-yellow-500 text-sm">
            {"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}
          </div>
          <div className="flex items-center gap-2">
            {isActive && hasMultipleImages && (
              <ReviewNavigationControls onNavigate={navigateImages} />
            )}
            <ReviewStreamControl isActive={isActive} onToggle={toggleReviewStream} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;