import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/components/theme/ThemeProvider";

interface BoxOfficeMovie {
  title: string;
  earnings: number;
}

interface NewsRoundupSources {
  boxOffice?: BoxOfficeMovie[];
}

interface NewsRoundupData {
  id: string;
  content: string;
  sources: NewsRoundupSources;
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
      return data?.[0] as NewsRoundupData;
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
    // First, split the content at the trends marker
    const [headlinesContent = '', trendsContent = ''] = content.split('🔍 Trending on Google:');
    
    // Process headlines - remove empty lines and trim each line
    const headlines = headlinesContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.includes('🔍 Trending on Google:'));
    
    // Process trends - remove empty lines and trim each line
    const trends = trendsContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    return (
      <div className="grid gap-8">
        {headlines.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Latest Headlines</h3>
            <div className="space-y-2 text-left">
              {headlines.map((headline, index) => (
                <p key={index} className="leading-relaxed">
                  {headline}
                </p>
              ))}
            </div>
          </div>
        )}
        
        {trends.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Trending on Google</h3>
            <div className="space-y-2 text-left">
              {trends.map((trend, index) => (
                <p key={index} className="leading-relaxed">
                  {trend}
                </p>
              ))}
            </div>
          </div>
        )}
        
        {newsRoundup?.sources?.boxOffice && newsRoundup.sources.boxOffice.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Box Office Numbers</h3>
            <div className="space-y-2 text-left">
              {newsRoundup.sources.boxOffice.map((movie, index) => (
                <p key={index} className="leading-relaxed flex justify-between items-center">
                  <span className="font-medium">{movie.title}</span>
                  <span className="text-muted-foreground">
                    ${movie.earnings.toLocaleString()}
                  </span>
                </p>
              ))}
            </div>
          </div>
        )}
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