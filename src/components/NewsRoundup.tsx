import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Newspaper } from "lucide-react";

const NewsRoundup = () => {
  const { data: newsRoundup, isLoading, error } = useQuery({
    queryKey: ['news-roundup'],
    queryFn: async () => {
      console.log('Fetching news roundup...');
      const { data, error } = await supabase
        .from('news_roundups')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Fetched news:', data);
      return data;
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
          <div className="text-white/60 text-center py-4">No news available. Please wait for the next update.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default NewsRoundup;