import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import ReviewDialog from "./ReviewDialog";
import ReviewList from "./ReviewList";
import ReviewHeader from "./ReviewHeader";
import type { Review } from "./types";

interface ReviewsProps {
  showViewAllLink?: boolean;
  reviews?: Review[];
  simpleView?: boolean;
  limit?: number;
}

const Reviews = ({ showViewAllLink = false, reviews: propReviews, simpleView = false, limit }: ReviewsProps) => {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [totalReviews, setTotalReviews] = useState(0);

  const { data: fetchedReviews = [], refetch } = useQuery({
    queryKey: ['reviews', limit],
    queryFn: async () => {
      try {
        let query = supabase
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (limit) {
          query = query.limit(limit);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        return data as Review[];
      } catch (error) {
        console.error('Error fetching reviews:', error);
        return [];
      }
    },
  });

  useEffect(() => {
    const fetchTotalReviews = async () => {
      try {
        const { count, error } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true });
        
        if (!error && count !== null) {
          setTotalReviews(count);
        }
      } catch (error) {
        console.error('Error fetching total reviews:', error);
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
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const reviews = propReviews || fetchedReviews || [];

  const handleReviewClick = (review: Review) => {
    if (!review) return;
    setSelectedReview(review);
    setDialogOpen(true);
  };

  return (
    <Card className="w-full bg-background border border-gray-200 dark:border-white/10 relative pb-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <ReviewHeader 
          showViewAllLink={showViewAllLink} 
          onReviewAdded={refetch}
        />
        <Link 
          to="/reviews/stream" 
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Eye className="h-4 w-4" />
          Stream View
        </Link>
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