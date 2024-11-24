import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

const SocialGraph = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: followerHistory = [] } = useQuery({
    queryKey: ['follower-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('follower_history')
        .select('*')
        .order('recorded_at', { ascending: true });
      
      if (error) throw error;
      
      return data.map(entry => ({
        name: new Date(entry.recorded_at).toLocaleString('default', { month: 'short', day: 'numeric' }),
        followers: entry.total_followers,
        date: entry.recorded_at,
      }));
    },
  });

  const addHistoryEntryMutation = useMutation({
    mutationFn: async (totalFollowers: number) => {
      const { error } = await supabase
        .from('follower_history')
        .insert([{ total_followers: totalFollowers }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follower-history'] });
      toast({
        title: "History Updated",
        description: "Follower history has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const calculateTotalFollowers = () => {
      const elements = document.querySelectorAll('.digital');
      let total = 0;
      
      elements.forEach(el => {
        const followers = el.textContent?.trim() || '';
        if (followers) {
          const multiplier = followers.includes('K') ? 1000 : followers.includes('M') ? 1000000 : 1;
          const number = parseFloat(followers.replace(/[K,M]/g, '')) * multiplier;
          if (!isNaN(number)) {
            total += number;
          }
        }
      });

      return total;
    };

    const observer = new MutationObserver(() => {
      const total = calculateTotalFollowers();
      if (total > 0) {
        addHistoryEntryMutation.mutate(total);
      }
    });

    const digitalElements = document.querySelectorAll('.digital');
    digitalElements.forEach(element => {
      observer.observe(element, { childList: true, characterData: true, subtree: true });
    });

    // Initial calculation
    const initialTotal = calculateTotalFollowers();
    if (initialTotal > 0) {
      addHistoryEntryMutation.mutate(initialTotal);
    }

    return () => observer.disconnect();
  }, []);

  if (!followerHistory.length) {
    return (
      <Card className="bg-black/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg sm:text-xl">Total Followers Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] sm:h-[350px] md:h-[400px] w-full flex items-center justify-center text-white/60">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/50 border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-lg sm:text-xl">Total Followers Growth</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] sm:h-[350px] md:h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={followerHistory} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="name" 
                stroke="#fff"
                tick={{ fill: '#fff' }}
                fontSize={12}
              />
              <YAxis 
                stroke="#fff"
                tick={{ fill: '#fff' }}
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#000',
                  border: '1px solid #333',
                  color: '#fff'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="followers" 
                stroke="#ff1717"
                strokeWidth={2}
                dot={{ fill: '#ff1717' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialGraph;