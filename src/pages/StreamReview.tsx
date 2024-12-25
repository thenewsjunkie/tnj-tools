import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tv, Film, Utensils, Package } from "lucide-react";
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

  return (
    <div className="min-h-screen p-8">
      <div className="space-y-6 max-w-3xl bg-black/60 p-8 rounded-xl backdrop-blur-sm border border-white/10">
        <div className="flex items-center gap-3">
          <Icon className="h-8 w-8 text-neon-red" />
          <h2 className="text-3xl font-semibold text-white/90">{activeReview.title}</h2>
        </div>
        
        <div className="text-3xl text-yellow-500">
          {"★".repeat(activeReview.rating)}{"☆".repeat(5-activeReview.rating)}
        </div>

        {activeReview.image_urls?.length > 0 && (
          <div className="relative">
            <img 
              src={activeReview.image_urls[0]} 
              alt={activeReview.title}
              className="rounded-lg w-full h-auto object-contain max-h-[400px] bg-black/40 p-2"
            />
          </div>
        )}

        <p className="text-2xl text-white/90 leading-relaxed">{activeReview.content}</p>
      </div>
    </div>
  );
};

export default StreamReview;