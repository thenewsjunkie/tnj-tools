import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/components/theme/ThemeProvider";
import BoxOfficeChart from "./BoxOfficeChart";

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
      return data?.[0] || null;
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
      toast({
        title: "Error",
        description: "Failed to fetch news. Please try again in a few minutes.",
        variant: "destructive",
      });
    }
  });

  const formatContent = (content: string) => {
    const parts = content.split('🔍 Trending on Google:');
    const headlines = parts[0].trim();
    const trends = parts[1]?.trim();

    return (
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Latest Headlines</h3>
          <div className="space-y-2 text-left">
            {headlines.split('\n').map((headline, index) => (
              headline.trim() && (
                <p key={index} className="leading-relaxed">
                  {headline.trim()}
                </p>
              )
            ))}
          </div>
        </div>
        <div className="space-y-8">
          {trends && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Trending on Google</h3>
              <div className="space-y-2 text-left">
                {trends.split('\n').map((trend, index) => (
                  trend.trim() && (
                    <p key={index} className="leading-relaxed">
                      {trend.trim()}
                    </p>
                  )
                ))}
              </div>
            </div>
          )}
          <BoxOfficeChart />
        </div>
      </div>
    );
  };

  const bgColor = theme === 'light' ? 'bg-white' : 'bg-black/50';
  const borderColor = theme === 'light' ? 'border-gray-200' : 'border-white/10';

  return (
    <Card className={`${bgColor} border-${borderColor}`}>
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