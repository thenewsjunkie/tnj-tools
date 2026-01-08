import { useState, useEffect, useCallback } from "react";
import { format, addDays, subDays } from "date-fns";
import { ChevronLeft, ChevronRight, Printer, Volume2, Loader2, Link as LinkIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { generateTILPrintDocument } from "./til/PrintTIL";

interface TILEntry {
  id?: string;
  date: string;
  story1_url: string | null;
  story1_title: string | null;
  story1_description: string | null;
  story2_url: string | null;
  story2_title: string | null;
  story2_description: string | null;
  story3_url: string | null;
  story3_title: string | null;
  story3_description: string | null;
  story4_url: string | null;
  story4_title: string | null;
  story4_description: string | null;
  story5_url: string | null;
  story5_title: string | null;
  story5_description: string | null;
  story6_url: string | null;
  story6_title: string | null;
  story6_description: string | null;
  story7_url: string | null;
  story7_title: string | null;
  story7_description: string | null;
}

const AUDIO_STORIES = [1, 3, 5, 7];

const emptyEntry = (date: string): TILEntry => ({
  date,
  story1_url: null, story1_title: null, story1_description: null,
  story2_url: null, story2_title: null, story2_description: null,
  story3_url: null, story3_title: null, story3_description: null,
  story4_url: null, story4_title: null, story4_description: null,
  story5_url: null, story5_title: null, story5_description: null,
  story6_url: null, story6_title: null, story6_description: null,
  story7_url: null, story7_title: null, story7_description: null,
});

const TodayILearned = () => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [localData, setLocalData] = useState<TILEntry | null>(null);
  const [fetchingStory, setFetchingStory] = useState<number | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const queryClient = useQueryClient();
  
  const dateStr = format(currentDate, "yyyy-MM-dd");

  const { data: dbData, isLoading } = useQuery({
    queryKey: ["til-entry", dateStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("til_entries")
        .select("*")
        .eq("date", dateStr)
        .maybeSingle();
      
      if (error) throw error;
      return data as TILEntry | null;
    },
  });

  // Reset dirty flag when changing dates
  useEffect(() => {
    setIsDirty(false);
  }, [dateStr]);

  // Sync from DB only when not dirty (no pending local changes)
  useEffect(() => {
    if (isDirty) return;
    if (dbData) {
      setLocalData(dbData);
    } else if (!isLoading) {
      setLocalData(emptyEntry(dateStr));
    }
  }, [dbData, dateStr, isLoading, isDirty]);

  const saveMutation = useMutation({
    mutationFn: async (entry: TILEntry): Promise<TILEntry> => {
      const { id, ...rest } = entry;
      if (id) {
        const { error } = await supabase
          .from("til_entries")
          .update(rest)
          .eq("id", id);
        if (error) throw error;
        return entry;
      } else {
        const { data, error } = await supabase
          .from("til_entries")
          .insert(rest)
          .select()
          .single();
        if (error) throw error;
        return data as TILEntry;
      }
    },
    onSuccess: (savedEntry) => {
      setIsDirty(false);
      // Update localData with the saved entry (includes id for new records)
      // No need to invalidate query - we already have the correct data from the save response
      if (savedEntry) {
        setLocalData(savedEntry);
      }
    },
    onError: (error) => {
      toast.error("Failed to save: " + error.message);
    },
  });

  // Debounced save
  useEffect(() => {
    if (!localData) return;
    const timeout = setTimeout(() => {
      saveMutation.mutate(localData);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [localData]);

  const updateStory = useCallback((storyNum: number, field: "url" | "title" | "description", value: string) => {
    setIsDirty(true);
    setLocalData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [`story${storyNum}_${field}`]: value || null,
      };
    });
  }, []);

  const clearStory = useCallback((storyNum: number) => {
    setIsDirty(true);
    setLocalData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [`story${storyNum}_url`]: null,
        [`story${storyNum}_title`]: null,
        [`story${storyNum}_description`]: null,
      };
    });
    toast.success(`Cleared story ${storyNum}`);
  }, []);

  const fetchRedditPost = async (storyNum: number, url: string) => {
    if (!url) return;
    
    setFetchingStory(storyNum);
    try {
      const response = await supabase.functions.invoke("fetch-reddit-post", {
        body: { url },
      });
      
      if (response.error) throw response.error;
      
      // Check for error in the response data
      if (response.data?.error) {
        throw new Error(response.data.error);
      }
      
      const { title, description } = response.data;
      setIsDirty(true);
      setLocalData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          [`story${storyNum}_title`]: title || prev[`story${storyNum}_title` as keyof TILEntry],
          [`story${storyNum}_description`]: description || prev[`story${storyNum}_description` as keyof TILEntry],
        };
      });
      
      if (title && !description) {
        toast.success(`Fetched title for story ${storyNum} (no description available)`);
      } else {
        toast.success(`Fetched story ${storyNum}`);
      }
    } catch (error: any) {
      const msg = error.message || "Unknown error";
      toast.error(msg, { duration: 5000 });
      console.error("Reddit fetch error:", msg);
    } finally {
      setFetchingStory(null);
    }
  };

  const getFilledCount = () => {
    if (!localData) return 0;
    let count = 0;
    for (let i = 1; i <= 7; i++) {
      const title = localData[`story${i}_title` as keyof TILEntry];
      if (title) count++;
    }
    return count;
  };

  const handlePrint = () => {
    if (!localData) return;
    generateTILPrintDocument(localData, currentDate);
  };

  if (isLoading || !localData) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const filledCount = getFilledCount();

  return (
    <div className="space-y-4">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(d => subDays(d, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[180px] text-center">
            {format(currentDate, "EEEE, MMMM d, yyyy")}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(d => addDays(d, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant={filledCount === 7 ? "default" : "secondary"}>
            {filledCount}/7 stories
          </Badge>
          <Button onClick={handlePrint} size="sm" variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Story inputs */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6, 7].map((num) => {
          const isAudio = AUDIO_STORIES.includes(num);
          const url = localData[`story${num}_url` as keyof TILEntry] as string || "";
          const title = localData[`story${num}_title` as keyof TILEntry] as string || "";
          const description = localData[`story${num}_description` as keyof TILEntry] as string || "";
          
          return (
            <div
              key={num}
              className="border border-border rounded-lg p-3 bg-card/50"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Story {num}
                  </span>
                  {isAudio && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Volume2 className="h-3 w-3" />
                      Audio
                    </Badge>
                  )}
                </div>
                {(url || title || description) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearStory(num)}
                    className="h-6 px-2 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Reddit URL"
                      value={url}
                      onChange={(e) => updateStory(num, "url", e.target.value)}
                      className="pl-8 text-sm"
                    />
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => fetchRedditPost(num, url)}
                    disabled={!url || fetchingStory === num}
                  >
                    {fetchingStory === num ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Fetch"
                    )}
                  </Button>
                </div>
                
                <Input
                  placeholder="Title"
                  value={title}
                  onChange={(e) => updateStory(num, "title", e.target.value)}
                  className="text-sm"
                />
                
                <Textarea
                  placeholder="Description"
                  value={description}
                  onChange={(e) => updateStory(num, "description", e.target.value)}
                  className="text-sm min-h-[60px] resize-none"
                  rows={2}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TodayILearned;
