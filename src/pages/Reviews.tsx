import { useState } from "react";
import Reviews from "@/components/reviews/Reviews";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Review, ReviewType } from "@/components/reviews/types";
import { Tv, Film, Utensils, Package } from "lucide-react";

const ReviewsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<ReviewType | "all">("all");

  const { data: reviews = [] } = useQuery({
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

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || review.type === selectedType;
    return matchesSearch && matchesType;
  });

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
      
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select
            value={selectedType}
            onValueChange={(value: ReviewType | "all") => setSelectedType(value)}
          >
            <SelectTrigger className="w-[180px] dark:bg-black dark:text-white">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent className="dark:bg-black dark:border-white/10">
              <SelectItem value="all" className="dark:text-white dark:focus:bg-white/10">
                All Types
              </SelectItem>
              <SelectItem value="television" className="dark:text-white dark:focus:bg-white/10">
                <div className="flex items-center gap-2">
                  <Tv className="h-4 w-4" />
                  <span>Television Series</span>
                </div>
              </SelectItem>
              <SelectItem value="movie" className="dark:text-white dark:focus:bg-white/10">
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4" />
                  <span>Movie</span>
                </div>
              </SelectItem>
              <SelectItem value="food" className="dark:text-white dark:focus:bg-white/10">
                <div className="flex items-center gap-2">
                  <Utensils className="h-4 w-4" />
                  <span>Food</span>
                </div>
              </SelectItem>
              <SelectItem value="product" className="dark:text-white dark:focus:bg-white/10">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>Product</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Reviews />
      </div>
    </div>
  );
};

export default ReviewsPage;