import Reviews from "@/components/reviews/Reviews";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const ReviewsPage = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <nav className="flex justify-between items-center mb-8 max-w-7xl mx-auto">
        <Link 
          to="/" 
          className="text-foreground hover:text-neon-red transition-colors"
        >
          ← Home
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <h1 className="text-foreground text-xl sm:text-2xl digital">TNJ Reviews</h1>
        </div>
      </nav>
      
      <div className="max-w-3xl mx-auto">
        <Reviews />
      </div>
    </div>
  );
};

export default ReviewsPage;