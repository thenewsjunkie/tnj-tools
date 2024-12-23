import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Plus, X } from "lucide-react";

const LowerThirds = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newLowerThird, setNewLowerThird] = useState({
    title: "",
    type: "news" as const,
    primary_text: "",
    secondary_text: "",
    ticker_text: "",
    show_time: false,
  });

  // Fetch all lower thirds
  const { data: lowerThirds, isLoading } = useQuery({
    queryKey: ["lower-thirds"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lower_thirds")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (newLowerThird: Partial<Tables<"lower_thirds">>) => {
      const { data, error } = await supabase
        .from("lower_thirds")
        .insert([newLowerThird])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lower-thirds"] });
      setNewLowerThird({
        title: "",
        type: "news",
        primary_text: "",
        secondary_text: "",
        ticker_text: "",
        show_time: false,
      });
      toast({
        title: "Lower third created",
        description: "New lower third has been created successfully.",
      });
    },
  });

  // Toggle active state mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      // First, deactivate all lower thirds
      if (isActive) {
        await supabase
          .from("lower_thirds")
          .update({ is_active: false })
          .neq("id", id);
      }

      // Then update the selected lower third
      const { data, error } = await supabase
        .from("lower_thirds")
        .update({ is_active: isActive })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lower-thirds"] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("lower_thirds")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lower-thirds"] });
      toast({
        title: "Lower third deleted",
        description: "The lower third has been deleted successfully.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newLowerThird);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Lower Thirds Manager</h1>

      {/* Create new lower third */}
      <Card className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newLowerThird.title}
                onChange={(e) =>
                  setNewLowerThird((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Internal title for this lower third"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={newLowerThird.type}
                onValueChange={(value: "news" | "guest" | "topic" | "breaking") =>
                  setNewLowerThird((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="news">News</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                  <SelectItem value="topic">Topic</SelectItem>
                  <SelectItem value="breaking">Breaking</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="primary_text">Primary Text</Label>
              <Input
                id="primary_text"
                value={newLowerThird.primary_text}
                onChange={(e) =>
                  setNewLowerThird((prev) => ({
                    ...prev,
                    primary_text: e.target.value,
                  }))
                }
                placeholder="Main text"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary_text">Secondary Text</Label>
              <Input
                id="secondary_text"
                value={newLowerThird.secondary_text}
                onChange={(e) =>
                  setNewLowerThird((prev) => ({
                    ...prev,
                    secondary_text: e.target.value,
                  }))
                }
                placeholder="Subtitle or additional information"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticker_text">Ticker Text</Label>
              <Input
                id="ticker_text"
                value={newLowerThird.ticker_text}
                onChange={(e) =>
                  setNewLowerThird((prev) => ({
                    ...prev,
                    ticker_text: e.target.value,
                  }))
                }
                placeholder="Scrolling text (optional)"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show_time"
                checked={newLowerThird.show_time}
                onCheckedChange={(checked) =>
                  setNewLowerThird((prev) => ({ ...prev, show_time: checked }))
                }
              />
              <Label htmlFor="show_time">Show Time</Label>
            </div>
          </div>

          <Button type="submit" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Create Lower Third
          </Button>
        </form>
      </Card>

      {/* List of lower thirds */}
      <div className="space-y-4">
        {lowerThirds?.map((lt) => (
          <Card key={lt.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h3 className="font-bold">{lt.title}</h3>
                <p className="text-sm text-muted-foreground">Type: {lt.type}</p>
                {lt.primary_text && (
                  <p className="text-sm">Primary: {lt.primary_text}</p>
                )}
                {lt.secondary_text && (
                  <p className="text-sm">Secondary: {lt.secondary_text}</p>
                )}
                {lt.ticker_text && (
                  <p className="text-sm">Ticker: {lt.ticker_text}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={lt.is_active}
                  onCheckedChange={(checked) =>
                    toggleActiveMutation.mutate({ id: lt.id, isActive: checked })
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMutation.mutate(lt.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LowerThirds;