import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/components/theme/ThemeProvider";
import Headlines from "./news/Headlines";
import Trends from "./news/Trends";

interface NewsRoundupData {
  id: string;
  content: string;
  sources: any;
  created_at: string | null;
  updated_at: string | null;
}

const NewsRoundup = () => {
  const { toast } = useToast();
  const { theme } = useTheme();
  
  const { data: newsRoundup, isLoading, error, refetch } = useQuery({
    queryKey: ['news-roundup'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_roundups')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      if (!data || data.length === 0) return null;
      
      return data[0] as NewsRoundupData;
    }
  });

  const fetchNewsMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-news', {
        body: { timestamp: new Date().toISOString() }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Success",
        description: "News and trends fetched successfully",
      });
    },
    onError: (error) => {
      console.error('Error fetching news:', error);
      toast({
        title: "Error",
        description: "Failed to fetch news. Please try again in a few minutes.",
        variant: "destructive",
      });
    }
  });

  const formatContent = (content: string) => {
    // Split content into sections
    const sections = content.split('🔍 Trending on Google:');

    // Get headlines section (first part)
    const headlinesSection = sections[0] || '';

    // Get trends section (second part)
    const trendsSection = sections[1] || '';

    // Process headlines
    const headlines = headlinesSection
      .split('\n')
      .map(line => {
        const text = line.substring(0, line.lastIndexOf(' - ')).trim();
        const url = line.substring(line.lastIndexOf(' - ') + 3).trim();
        
        if (!text || !url) return null;
        return { text, url };
      })
      .filter((headline): headline is { text: string; url: string } => 
        headline !== null && 
        headline.text.length > 0 && 
        headline.url.length > 0
      );

    // Process trends
    const trends = trendsSection
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    return (
      <div className="space-y-8">
        {headlines.length > 0 && <Headlines headlines={headlines} />}
        {trends.length > 0 && <Trends trends={trends} />}
      </div>
    );
  };

  const bgColor = theme === 'light' ? 'bg-white' : 'bg-black/50';

  return (
    <Card className={`${bgColor} border border-gray-200 dark:border-white/10`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Newspaper className="w-5 h-5" />
          News & Trends Roundup
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fetchNewsMutation.mutate()}
          disabled={fetchNewsMutation.isPending}
        >
          <RefreshCw className={`h-4 w-4 ${fetchNewsMutation.isPending ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-muted-foreground text-center py-8">
            Loading news and trends...
          </div>
        ) : error ? (
          <div className="text-red-400 text-center py-8">
            Error loading news: {error.message}
          </div>
        ) : newsRoundup ? (
          formatContent(newsRoundup.content)
        ) : (
          <div className="text-muted-foreground text-center py-8">
            No news available. Click refresh to fetch the latest news and trends.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NewsRoundup;