import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ReviewDialog from "./ReviewDialog";
import ReviewList from "./ReviewList";
import ReviewHeader from "./ReviewHeader";
import type { Review } from "./types";

interface ReviewsProps {
  showViewAllLink?: boolean;
  reviews?: Review[];
  simpleView?: boolean;
}

const Reviews = ({ showViewAllLink = false, reviews: propReviews, simpleView = false }: ReviewsProps) => {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [totalReviews, setTotalReviews] = useState(0);

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
  });

  useEffect(() => {
    const fetchTotalReviews = async () => {
      const { count, error } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true });
      
      if (!error && count !== null) {
        setTotalReviews(count);
      }
    };

    fetchTotalReviews();

    const channel = supabase.channel('reviews-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews'
        },
        () => {
          fetchTotalReviews();
          refetch(); // Add this to refresh the reviews list when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]); // Add refetch to the dependency array

  const reviews = propReviews || fetchedReviews;

  const handleReviewClick = (review: Review) => {
    setSelectedReview(review);
    setDialogOpen(true);
  };

  return (
    <Card className="w-full bg-background border border-gray-200 dark:border-white/10 relative pb-8">
      <CardHeader>
        <ReviewHeader 
          showViewAllLink={showViewAllLink} 
          onReviewAdded={refetch} // Pass refetch as onReviewAdded
        />
      </CardHeader>
      <CardContent>
        <ReviewList
          reviews={reviews}
          onReviewClick={handleReviewClick}
          simpleView={simpleView}
        />
      </CardContent>

      <div className="absolute bottom-3 right-4 text-xs text-muted-foreground">
        Total Reviews: {totalReviews}
      </div>

      <ReviewDialog
        review={selectedReview}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </Card>
  );
};

export default Reviews;