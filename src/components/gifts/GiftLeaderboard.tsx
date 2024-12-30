import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Crown, Gift, Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface GiftStats {
  username: string;
  total_gifts: number;
  monthly_gifts: Record<string, number>;
  yearly_gifts: Record<string, number>;
}

const GiftLeaderboard = () => {
  const { data: giftStats, isLoading } = useQuery({
    queryKey: ['gift-stats'],
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

  const getCurrentYearKey = () => {
    return new Date().getFullYear().toString();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[150px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const monthlyKey = getCurrentMonthKey();
  const yearKey = getCurrentYearKey();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Top Gifters
          </CardTitle>
          <CardDescription>
            The most generous members of our community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {giftStats?.map((stat, index) => (
              <div
                key={stat.username}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-gray-500 dark:text-gray-400">
                    #{index + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold">{stat.username}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Gift className="h-4 w-4" />
                      <span>{stat.total_gifts} total gifts</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="text-right">
                    <div className="font-medium">This Month</div>
                    <div className="text-gray-500 dark:text-gray-400">
                      {stat.monthly_gifts?.[monthlyKey] || 0}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">This Year</div>
                    <div className="text-gray-500 dark:text-gray-400">
                      {stat.yearly_gifts?.[yearKey] || 0}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {(!giftStats || giftStats.length === 0) && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No gift statistics available yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GiftLeaderboard;