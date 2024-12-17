import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const Instructions = () => {
  const [content, setContent] = useState("");
  const { toast } = useToast();

  const { data: instructions, isLoading } = useQuery({
    queryKey: ["instructions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instructions")
        .select("*")
        .single();

      if (error) throw error;
      setContent(data.content);
      return data;
    },
  });

  const handleSave = async () => {
    const { error } = await supabase
      .from("instructions")
      .update({ content })
      .eq("id", instructions?.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save instructions",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Instructions saved successfully",
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <nav className="flex justify-between items-center mb-8">
        <Link
          to="/settings"
          className="text-foreground hover:text-primary transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Settings
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Instructions</h2>
            <p className="text-sm text-muted-foreground">
              Add instructions for users of the website
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter instructions here..."
            className="min-h-[400px]"
          />
          <Button onClick={handleSave}>Save Instructions</Button>
        </div>
      </div>
    </div>
  );
};

export default Instructions;