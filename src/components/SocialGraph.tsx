import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const SocialGraph = () => {
  const queryClient = useQueryClient();

  const { data: followerHistory = [] } = useQuery({
    queryKey: ['follower-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('follower_history')
        .select('*')
        .order('recorded_at', { ascending: true })
        .limit(6);
      
      if (error) throw error;
      
      return data.map(entry => ({
        name: new Date(entry.recorded_at).toLocaleString('default', { month: 'short' }),
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
    },
  });

  useEffect(() => {
    const updateTotalFollowers = () => {
      const elements = document.querySelectorAll('.digital');
      let total = 0;
      
      elements.forEach(el => {
        const followers = el.textContent?.trim() || '';
        const number = parseInt(followers.replace(/[K,M]/g, '')) * (followers.includes('K') ? 1000 : (followers.includes('M') ? 1000000 : 1));
        total += number;
      });

      addHistoryEntryMutation.mutate(total);
    };

    const observer = new MutationObserver(() => {
      updateTotalFollowers();
    });

    const digitalElements = document.querySelectorAll('.digital');
    digitalElements.forEach(element => {
      observer.observe(element, { childList: true, characterData: true, subtree: true });
    });

    return () => observer.disconnect();
  }, []);

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