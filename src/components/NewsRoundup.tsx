import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const NewsRoundup = () => {
  const { toast } = useToast();
  
  const { data: newsRoundup, isLoading, error, refetch } = useQuery({
    queryKey: ['news-roundup'],
    queryFn: async () => {
      console.log('Fetching news roundup...');
      const { data, error } = await supabase
        .from('news_roundups')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Fetched news:', data);
      return data?.[0] || null;
    }
  });

  const fetchNewsMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-news');
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Success",
        description: "News fetched successfully",
      });
    },
    onError: (error) => {
      console.error('Error fetching news:', error);
      toast({
        title: "Error",
        description: "Failed to fetch news: " + error.message,
        variant: "destructive",
      });
    }
  });

  return (
    <Card className="bg-black/50 border-white/10">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-white text-xl font-semibold">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5" />
            News Roundup
          </div>
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fetchNewsMutation.mutate()}
          disabled={fetchNewsMutation.isPending}
          className="text-white hover:text-primary hover:bg-white/10"
        >
          <RefreshCw className={`h-4 w-4 ${fetchNewsMutation.isPending ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-white/60 text-center py-4">Loading news...</div>
        ) : error ? (
          <div className="text-red-400 text-center py-4">
            Error loading news: {error.message}
          </div>
        ) : newsRoundup ? (
          <div className="text-white space-y-4">
            <pre className="whitespace-pre-wrap font-sans">{newsRoundup.content}</pre>
          </div>
        ) : (
          <div className="text-white/60 text-center py-4">No news available. Click refresh to fetch the latest news.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default NewsRoundup;