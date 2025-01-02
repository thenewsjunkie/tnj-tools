import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Review } from "./types";
import { supabase } from "@/integrations/supabase/client";
import EditReviewFormFields from "./EditReviewFormFields";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

const formSchema = z.object({
  type: z.enum(["television", "movie", "food", "product"]),
  title: z.string().min(1, "Title is required"),
  rating: z.number().min(1, "Rating is required"),
  content: z.string().min(1, "Content is required"),
  genre: z.string().optional(),
  image_urls: z.array(z.string()).optional(),
});

interface EditReviewDialogProps {
  review: Review;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReviewUpdated?: () => void;
}

const EditReviewDialog = ({ review, open, onOpenChange, onReviewUpdated }: EditReviewDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: review.type,
      title: review.title,
      rating: review.rating,
      content: review.content,
      genre: review.genre || undefined,
      image_urls: review.image_urls || [],
    },
  });

  // Reset form when review changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        type: review.type,
        title: review.title,
        rating: review.rating,
        content: review.content,
        genre: review.genre || undefined,
        image_urls: review.image_urls || [],
      });
    }
  }, [review, open, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("reviews")
        .update({
          type: values.type,
          title: values.title,
          rating: values.rating,
          content: values.content,
          genre: values.genre,
          image_urls: values.image_urls,
        })
        .eq("id", review.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Review updated successfully",
      });
      onOpenChange(false);
      onReviewUpdated?.();
    } catch (error) {
      console.error("Error updating review:", error);
      toast({
        title: "Error",
        description: "Failed to update review",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", review.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Review deleted successfully",
      });
      onOpenChange(false);
      onReviewUpdated?.();
    } catch (error) {
      console.error("Error deleting review:", error);
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Review</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <EditReviewFormFields form={form} />
            
            <div className="flex justify-between items-center pt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the review.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                  className="text-foreground"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-primary text-black hover:text-white dark:text-white"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditReviewDialog;