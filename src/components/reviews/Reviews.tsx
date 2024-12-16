import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tv, Film, Utensils, Package, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import AddReviewDialog from "./AddReviewDialog";
import ReviewDialog from "./ReviewDialog";
import type { Review } from "./types";

interface ReviewsProps {
  showViewAllLink?: boolean;
  reviews?: Review[];
}

const Reviews = ({ showViewAllLink = false, reviews: propReviews }: ReviewsProps) => {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: fetchedReviews = [], refetch } = useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Review[];
    },
    enabled: !propReviews, // Only fetch if reviews weren't passed as props
  });

  const reviews = propReviews || fetchedReviews;

  const icons = {
    television: Tv,
    movie: Film,
    food: Utensils,
    product: Package,
  };

  const handleReviewClick = (review: Review) => {
    setSelectedReview(review);
    setDialogOpen(true);
  };

  return (
    <Card className="w-full bg-background border border-gray-200 dark:border-white/10">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            Reviews
            {showViewAllLink && (
              <Link 
                to="/reviews" 
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                View All
              </Link>
            )}
          </div>
          <AddReviewDialog onReviewAdded={refetch} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {reviews.map((review) => {
            const Icon = icons[review.type];
            
            return (
              <div
                key={review.id}
                onClick={() => handleReviewClick(review)}
                className="flex flex-col gap-4 p-4 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-accent cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-foreground" />
                    <h3 className="font-medium text-foreground">{review.title}</h3>
                  </div>
                  <div className="text-yellow-500">
                    {"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}
                  </div>
                </div>
                
                {review.image_url && (
                  <div className="relative aspect-video w-full">
                    <img 
                      src={review.image_url} 
                      alt={review.title}
                      className="rounded-md object-cover w-full h-full"
                    />
                  </div>
                )}
                
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {review.content}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>

      <ReviewDialog
        review={selectedReview}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </Card>
  );
};

export default Reviews;