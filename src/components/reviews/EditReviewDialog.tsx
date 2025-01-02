import { useState } from "react";
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

  // Reset form when review changes
  React.useEffect(() => {
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
  }, [form, review, open]);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Review</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <EditReviewFormFields form={form} />
            
            <div className="flex justify-end space-x-2 pt-4">
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
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditReviewDialog;