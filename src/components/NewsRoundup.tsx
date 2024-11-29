import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, RefreshCw, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useState } from "react";

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
  const [showAllHeadlines, setShowAllHeadlines] = useState(false);
  
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
    // Split content into sections
    const sections = content.split('🔍 Trending on Google:');

    // Get headlines section (first part)
    const headlinesSection = sections[0] || '';

    // Get trends section (second part)
    const trendsSection = sections[1] || '';

    // Process headlines and limit to 10
    const headlines = headlinesSection
      .split('\n')
      .map(line => {
        const parts = line.split(' - ');
        return {
          text: parts[0].trim(),
          url: parts[1]?.trim() || '#'
        };
      })
      .filter(headline => headline.text.length > 0 && headline.url !== '#')
      .slice(0, 10);

    // Process trends
    const trends = trendsSection
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const visibleHeadlines = showAllHeadlines ? headlines : headlines.slice(0, 3);

    return (
      <div className="grid gap-8">
        {headlines.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Latest Headlines</h3>
            <div className="space-y-2 text-left">
              {visibleHeadlines.map((headline, index) => (
                <p key={index} className="leading-relaxed flex items-center justify-between group">
                  <span>{headline.text}</span>
                  <a 
                    href={headline.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors ml-2 opacity-0 group-hover:opacity-100"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </p>
              ))}
            </div>
            {headlines.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllHeadlines(!showAllHeadlines)}
                className="w-full flex items-center gap-2 text-muted-foreground hover:text-primary"
              >
                {showAllHeadlines ? (
                  <>Show Less <ChevronUp className="h-4 w-4" /></>
                ) : (
                  <>Show More <ChevronDown className="h-4 w-4" /></>
                )}
              </Button>
            )}
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