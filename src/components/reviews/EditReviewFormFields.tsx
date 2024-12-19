import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import ReviewTypeSelect from "./ReviewTypeSelect";
import MovieGenreSelect from "./MovieGenreSelect";
import RatingSelect from "./RatingSelect";
import ReviewImageUpload from "./ReviewImageUpload";
import { z } from "zod";

const formSchema = z.object({
  type: z.enum(["television", "movie", "food", "product"]),
  title: z.string().min(1, "Title is required"),
  rating: z.number().min(1, "Rating is required"),
  content: z.string().min(1, "Content is required"),
  genre: z.string().optional(),
  image_urls: z.array(z.string()).optional(),
});

interface EditReviewFormFieldsProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}

const EditReviewFormFields = ({ form }: EditReviewFormFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground">Type</FormLabel>
            <FormControl>
              <ReviewTypeSelect
                value={field.value}
                onValueChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground">Title</FormLabel>
            <FormControl>
              <Input {...field} className="text-foreground bg-background border-input" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="rating"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground">Rating</FormLabel>
            <FormControl>
              <RatingSelect
                value={field.value}
                onValueChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {form.watch("type") === "movie" && (
        <FormField
          control={form.control}
          name="genre"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Genre</FormLabel>
              <FormControl>
                <MovieGenreSelect
                  value={field.value}
                  onValueChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="content"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground">Content</FormLabel>
            <FormControl>
              <Textarea {...field} className="text-foreground bg-background border-input" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="image_urls"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground">Images</FormLabel>
            <FormControl>
              <ReviewImageUpload
                images={field.value || []}
                onImagesChange={field.onChange}
                title={form.getValues("title")}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default EditReviewFormFields;