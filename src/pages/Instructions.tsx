import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Edit2, Save } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import TextNote from "@/components/notes/note-types/TextNote";

const Instructions = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: instructions, isLoading } = useQuery({
    queryKey: ["instructions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instructions")
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  useEffect(() => {
    if (instructions?.content) {
      setEditContent(instructions.content);
    }
  }, [instructions?.content]);

  const updateInstructions = useMutation({
    mutationFn: async (newContent: string) => {
      const { error } = await supabase
        .from("instructions")
        .update({ content: newContent })
        .eq("id", instructions?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructions"] });
      toast({
        title: "Success",
        description: "Instructions saved successfully",
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save instructions",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateInstructions.mutate(editContent);
  };

  const handleCancel = () => {
    setEditContent(instructions?.content || "");
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <nav className="flex justify-between items-center mb-8">
        <Link
          to="/admin/settings"
          className="text-foreground hover:text-primary transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Settings
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight dark:text-white">Instructions</h2>
            <p className="text-sm text-muted-foreground">
              Website usage instructions and guidelines
            </p>
          </div>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="flex items-center gap-2 border-neon-red text-neon-red hover:bg-neon-red/10 dark:border-primary dark:text-primary dark:hover:bg-primary/10"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="pt-6">
            {isEditing ? (
              <div className="space-y-4">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Enter instructions here..."
                  className="min-h-[400px]"
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSave} 
                    className="flex items-center gap-2 bg-neon-red hover:bg-neon-red/90 text-white dark:bg-primary dark:hover:bg-primary/90"
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    className="text-gray-700 border-gray-300 hover:bg-gray-100 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {instructions?.content ? (
                  <TextNote content={instructions.content} />
                ) : (
                  <p className="text-muted-foreground italic">
                    No instructions have been added yet.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Instructions;