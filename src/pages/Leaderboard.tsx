import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GiftStats } from "@/integrations/supabase/types/tables/gifts";

const Leaderboard = () => {
  const { data: giftStats, isLoading } = useQuery({
    queryKey: ['giftStats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gift_stats')
        .select('*')
        .order('total_gifts', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as GiftStats[];
    },
  });

  const getCurrentMonthKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const getCurrentYear = () => {
    return new Date().getFullYear().toString();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 space-y-4">
        <h1 className="text-4xl font-bold text-center mb-8">Gift Leaderboard</h1>
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-16" />
          </Card>
        ))}
      </div>
    );
  }

  if (!giftStats?.length) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold text-center mb-8">Gift Leaderboard</h1>
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">No gift statistics available yet.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Gift Leaderboard</h1>
      <div className="grid gap-4">
        {giftStats.map((stat, index) => (
          <Card key={stat.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-primary w-8">
                  #{index + 1}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{stat.username}</h3>
                  <p className="text-sm text-muted-foreground">
                    Total Gifts: {stat.total_gifts}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm">
                  This Month: {stat.monthly_gifts?.[getCurrentMonthKey()] || 0}
                </p>
                <p className="text-sm">
                  This Year: {stat.yearly_gifts?.[getCurrentYear()] || 0}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;