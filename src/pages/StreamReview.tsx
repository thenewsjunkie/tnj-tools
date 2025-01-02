import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tv, Film, Utensils, Package } from "lucide-react";
import type { Review } from "@/components/reviews/types";

const StreamReview = () => {
  const { data: activeReview } = useQuery({
    queryKey: ['active-review'],
    queryFn: async () => {
      const { data: settings } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'active_review')
        .single();
      
      const value = settings?.value as { review_id: string | null, current_image_index?: number } | null;
      if (!value?.review_id) return null;

      const { data: review } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', value.review_id)
        .single();

      return { ...review, currentImageIndex: value.current_image_index ?? 0 } as Review & { currentImageIndex: number };
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
    <div className="min-h-screen w-screen">
      <div className="flex flex-col items-start max-w-fit bg-black/60 rounded-xl backdrop-blur-sm border border-white/10">
        <div className="w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Icon className="h-8 w-8 text-yellow-500" />
            <h2 className="text-2xl md:text-3xl font-semibold text-white/90">{activeReview.title}</h2>
          </div>
          <div className="text-3xl md:text-4xl text-yellow-500 ml-6">
            {"★".repeat(activeReview.rating)}{"☆".repeat(5-activeReview.rating)}
          </div>
        </div>
        
        {activeReview.image_urls?.length > 0 && (
          <div className="w-full flex justify-center items-center">
            <img 
              src={activeReview.image_urls[activeReview.currentImageIndex]} 
              alt={activeReview.title}
              className="max-h-[75vh] w-auto object-contain bg-black/40"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamReview;