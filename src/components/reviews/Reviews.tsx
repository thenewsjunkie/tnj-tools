import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tv, Film, Utensils, Package } from "lucide-react";
import AddReviewDialog from "./AddReviewDialog";
import ReviewDialog from "./ReviewDialog";
import { format } from "date-fns";
import type { Review } from "./types";

const Reviews = () => {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: reviews = [], refetch } = useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Review[];
    },
  });

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
          Reviews
          <AddReviewDialog onReviewAdded={refetch} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reviews.map((review) => {
            const Icon = icons[review.type];
            const reviewDate = format(new Date(review.created_at), "EEEE, MMMM d");
            
            return (
              <div
                key={review.id}
                onClick={() => handleReviewClick(review)}
                className="flex flex-col p-4 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-accent cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Icon className="h-5 w-5 text-foreground" />
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{review.title}</h3>
                  </div>
                  <div className="text-yellow-500">
                    {"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}
                  </div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Review: {reviewDate}
                </div>
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