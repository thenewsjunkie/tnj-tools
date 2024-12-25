import { LucideIcon, Eye } from "lucide-react";
import type { Review } from "./types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Json } from "@/integrations/supabase/types";

interface ReviewCardProps {
  review: Review;
  onClick: () => void;
  Icon: LucideIcon;
}

const ReviewCard = ({ review, onClick, Icon }: ReviewCardProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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

  const isActive = activeReviewId === review.id;

  const toggleReviewStream = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const value = { review_id: isActive ? null : review.id };
      
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key: 'active_review',
          value: value as unknown as Json,
        });

      if (error) throw error;

      toast({
        title: isActive ? "Review removed from stream" : "Review added to stream",
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

  return (
    <div
      onClick={onClick}
      className="flex flex-col gap-2 p-3 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-accent cursor-pointer transition-colors relative group"
    >
      <div className="flex items-center justify-between min-w-0">
        <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
          <Icon className="h-4 w-4 text-foreground flex-shrink-0" />
          <h3 className="font-medium text-sm text-foreground truncate">{review.title}</h3>
        </div>
        <div className="text-yellow-500 text-sm flex-shrink-0">
          {"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}
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
      
      <p className="text-xs text-muted-foreground line-clamp-2">
        {review.content}
      </p>

      <button
        onClick={toggleReviewStream}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-background/50 transition-colors"
      >
        <Eye 
          className={`h-4 w-4 ${isActive ? 'text-neon-red' : 'text-foreground'}`} 
        />
      </button>
    </div>
  );
};

export default ReviewCard;