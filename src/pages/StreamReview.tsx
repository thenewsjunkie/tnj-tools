import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tv, Film, Utensils, Package } from "lucide-react";
import { format } from "date-fns";
import type { Review } from "@/components/reviews/types";

interface ActiveReviewSettings {
  review_id: string | null;
}

const StreamReview = () => {
  const { data: activeReview } = useQuery({
    queryKey: ['active-review'],
    queryFn: async () => {
      const { data: settings } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'active_review')
        .single();
      
      const value = settings?.value as { review_id: string | null } | null;
      if (!value?.review_id) return null;

      const { data: review } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', value.review_id)
        .single();

      return review as Review;
    },
    refetchInterval: 1000,
  });

  if (!activeReview) return null;

  const icons = {
    television: Tv,
    movie: Film,
    food: Utensils,
    product: Package,
  };

  const Icon = icons[activeReview.type];
  const reviewDate = format(new Date(activeReview.created_at), "EEEE, MMMM d");

  return (
    <div className="min-h-screen p-4">
      <div className="space-y-4 max-w-2xl">
        <div className="flex items-center gap-2">
          <Icon className="h-8 w-8 text-white" />
          <h2 className="text-3xl font-semibold text-white">{activeReview.title}</h2>
        </div>
        
        <div className="text-3xl text-yellow-500">
          {"★".repeat(activeReview.rating)}{"☆".repeat(5-activeReview.rating)}
        </div>

        {activeReview.image_urls?.length > 0 && (
          <div className="relative">
            <img 
              src={activeReview.image_urls[0]} 
              alt={activeReview.title}
              className="rounded-lg w-full h-auto object-contain max-h-[400px]"
            />
          </div>
        )}

        <p className="text-xl text-white">{activeReview.content}</p>
        
        <div className="text-lg text-white/70">
          {reviewDate}
        </div>
      </div>
    </div>
  );
};

export default StreamReview;