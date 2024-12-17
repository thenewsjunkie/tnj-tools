import { Tv, Film, Utensils, Package } from "lucide-react";
import type { Review } from "./types";
import ReviewCard from "./ReviewCard";

interface ReviewListProps {
  reviews: Review[];
  onReviewClick: (review: Review) => void;
  simpleView?: boolean;
}

const ReviewList = ({ reviews, onReviewClick, simpleView = false }: ReviewListProps) => {
  const icons = {
    television: Tv,
    movie: Film,
    food: Utensils,
    product: Package,
  };

  if (simpleView) {
    return (
      <div className="space-y-2">
        {reviews.map((review) => {
          const Icon = icons[review.type];
          
          return (
            <div
              key={review.id}
              onClick={() => onReviewClick(review)}
              className="flex items-center justify-between p-2 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-accent cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                <Icon className="h-4 w-4 text-foreground flex-shrink-0" />
                <h3 className="font-medium text-sm text-foreground truncate">{review.title}</h3>
              </div>
              <div className="text-yellow-500 text-sm flex-shrink-0">
                {"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}
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