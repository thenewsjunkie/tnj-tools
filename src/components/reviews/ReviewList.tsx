import { Tv, Film, Utensils, Package, Eye } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Json } from "@/integrations/supabase/types";
import type { Review } from "./types";
import ReviewCard from "./ReviewCard";

interface ReviewListProps {
  reviews: Review[];
  onReviewClick: (review: Review) => void;
  simpleView?: boolean;
}

const ReviewList = ({ reviews, onReviewClick, simpleView = false }: ReviewListProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const icons = {
    television: Tv,
    movie: Film,
    food: Utensils,
    product: Package,
  };

  const { data: activeReviewId } = useQuery({
    queryKey: ['active-review-id'],
    queryFn: async () => {
      const { data: settings } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'active_review')
        .single();
      
      const value = settings?.value as { review_id: string | null } | null;
      return value?.review_id ?? null;
    },
  });

  const toggleReviewStream = async (reviewId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const value = { review_id: activeReviewId === reviewId ? null : reviewId };
      
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key: 'active_review',
          value: value as unknown as Json,
        });

      if (error) throw error;

      toast({
        title: activeReviewId === reviewId ? "Review removed from stream" : "Review added to stream",
        duration: 2000,
      });

      queryClient.invalidateQueries({ queryKey: ['active-review-id'] });
      queryClient.invalidateQueries({ queryKey: ['active-review'] });
    } catch (error) {
      console.error('Error toggling review stream:', error);
      toast({
        title: "Error updating stream",
        variant: "destructive",
      });
    }
  };

  if (simpleView) {
    return (
      <div className="space-y-2">
        {reviews.map((review) => {
          const Icon = icons[review.type];
          const isActive = activeReviewId === review.id;
          
          return (
            <div
              key={review.id}
              onClick={() => onReviewClick(review)}
              className="flex items-center justify-between p-2 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-accent cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Icon className="h-4 w-4 text-foreground flex-shrink-0" />
                <h3 className="font-medium text-sm text-foreground truncate">{review.title}</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-yellow-500 text-sm flex-shrink-0">
                  {"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}
                </div>
                <button
                  onClick={(e) => toggleReviewStream(review.id, e)}
                  className="p-1 rounded-full hover:bg-background/50 transition-colors"
                >
                  <Eye 
                    className={`h-4 w-4 ${isActive ? 'text-neon-red' : 'text-foreground'}`} 
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          onClick={() => onReviewClick(review)}
          Icon={icons[review.type]}
        />
      ))}
    </div>
  );
};

export default ReviewList;