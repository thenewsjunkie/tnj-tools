import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { CardTitle } from "@/components/ui/card";
import AddReviewDialog from "./AddReviewDialog";

interface ReviewHeaderProps {
  showViewAllLink?: boolean;
  onReviewAdded: () => void;
}

const ReviewHeader = ({ showViewAllLink = false, onReviewAdded }: ReviewHeaderProps) => {
  return (
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
      <AddReviewDialog onReviewAdded={onReviewAdded} />
    </CardTitle>
  );
};

export default ReviewHeader;