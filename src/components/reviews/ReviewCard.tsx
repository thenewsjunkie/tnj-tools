import { LucideIcon } from "lucide-react";
import type { Review } from "./types";

interface ReviewCardProps {
  review: Review;
  onClick: () => void;
  Icon: LucideIcon;
}

const ReviewCard = ({ review, onClick, Icon }: ReviewCardProps) => {
  return (
    <div
      onClick={onClick}
      className="flex flex-col gap-2 p-3 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-accent cursor-pointer transition-colors"
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
    </div>
  );
};

export default ReviewCard;