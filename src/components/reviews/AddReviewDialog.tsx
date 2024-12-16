import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Tv, Film, Utensils, Package, Skull, Zap, Rocket, Heart, Mountains } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddReviewDialogProps {
  onReviewAdded: () => void;
}

const AddReviewDialog = ({ onReviewAdded }: AddReviewDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"television" | "movie" | "food" | "product">();
  const [genre, setGenre] = useState<string>();
  const [rating, setRating] = useState<number>();
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !rating || !title || !content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (type === 'movie' && !genre) {
      toast({
        title: "Error",
        description: "Please select a genre for the movie",
        variant: "destructive",
      });
      return;
    }

    try {
      let imageUrl = null;
      if (image) {
        const formData = new FormData();
        formData.append('file', image);

        const { data, error: uploadError } = await supabase.functions.invoke('upload-show-note-image', {
          body: formData,
        });

        if (uploadError) throw uploadError;
        imageUrl = data.url;
      }

      const { error } = await supabase
        .from('reviews')
        .insert({
          type,
          title,
          rating,
          content,
          image_url: imageUrl,
          genre: type === 'movie' ? genre : null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Review added successfully",
      });

      setOpen(false);
      setTitle("");
      setType(undefined);
      setGenre(undefined);
      setRating(undefined);
      setContent("");
      setImage(null);
      onReviewAdded();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add review",
        variant: "destructive",
      });
    }
  };

  const remainingChars = 140 - content.length;

  const genreOptions = [
    { value: 'Horror', icon: Skull },
    { value: 'Action', icon: Zap },
    { value: 'Sci Fi', icon: Rocket },
    { value: 'Romantic Comedy', icon: Heart },
    { value: 'Adventure', icon: Mountains },
    { value: 'Comedy', icon: Heart },
    { value: 'Drama', icon: Film },
    { value: 'Animation', icon: Film },
    { value: 'Thriller', icon: Skull },
    { value: 'Other', icon: Film },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm"
          className="bg-neon-red text-white border-2 border-tnj-dark hover:bg-neon-red"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Review
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Review</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <Select onValueChange={(value: "television" | "movie" | "food" | "product") => setType(value)}>
            <SelectTrigger className="bg-white dark:bg-white dark:text-black">
              <SelectValue placeholder="Select review type" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-white">
              <SelectItem value="television" className="text-black dark:text-black">
                <div className="flex items-center gap-2">
                  <Tv className="h-4 w-4" />
                  <span>Television Series</span>
                </div>
              </SelectItem>
              <SelectItem value="movie" className="text-black dark:text-black">
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4" />
                  <span>Movie</span>
                </div>
              </SelectItem>
              <SelectItem value="food" className="text-black dark:text-black">
                <div className="flex items-center gap-2">
                  <Utensils className="h-4 w-4" />
                  <span>Food</span>
                </div>
              </SelectItem>
              <SelectItem value="product" className="text-black dark:text-black">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>Product</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {type === 'movie' && (
            <Select onValueChange={setGenre}>
              <SelectTrigger className="bg-white dark:bg-white dark:text-black">
                <SelectValue placeholder="Select movie genre" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-white">
                {genreOptions.map(({ value, icon: Icon }) => (
                  <SelectItem key={value} value={value} className="text-black dark:text-black">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{value}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-foreground"
          />

          <Select onValueChange={(value) => setRating(parseInt(value))}>
            <SelectTrigger className="bg-white dark:bg-white dark:text-black">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-white">
              {[1, 2, 3, 4, 5].map((star) => (
                <SelectItem key={star} value={star.toString()} className="text-black dark:text-black">
                  {"★".repeat(star)}{"☆".repeat(5-star)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-foreground"
            />
          </div>

          <div>
            <Textarea
              placeholder="Write your review..."
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 140))}
              className="text-foreground"
            />
            <p className="text-sm text-muted-foreground mt-1">
              {remainingChars} characters remaining
            </p>
          </div>

          <Button type="submit" className="w-full text-black">
            Add Review
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddReviewDialog;