import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useTheme } from "@/components/theme/ThemeProvider";
import { TrendingUp } from "lucide-react";

const BoxOfficeChart = () => {
  const { theme } = useTheme();
  
  const { data: boxOfficeData, isLoading, error } = useQuery({
    queryKey: ['box-office'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-news', {
        body: { type: 'box-office' }
      });
      
      if (error) throw error;
      return data?.boxOffice || [];
    }
  });

  if (isLoading) {
    return (
      <Card className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
        Loading box office data...
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-[300px] w-full flex items-center justify-center text-red-500">
        Error loading box office data
      </Card>
    );
  }

  if (!boxOfficeData?.length) {
    return (
      <Card className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
        No box office data available
      </Card>
    );
  }

  const chartData = boxOfficeData.map(movie => ({
    name: movie.title,
    value: movie.earnings,
  }));

  const config = {
    data: {
      theme: {
        light: theme === 'light' ? '#8B5CF6' : '#9b87f5',
        dark: theme === 'light' ? '#8B5CF6' : '#9b87f5',
      },
    },
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  return (
    <Card className="p-6 h-[300px] w-full">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">Weekend Box Office</h3>
      </div>
      <ChartContainer className="h-[230px] w-full" config={config}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, bottom: 5, left: 140 }}
          >
            <XAxis 
              type="number" 
              tickFormatter={formatCurrency}
              fontSize={11}
              tickMargin={8}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={130}
              fontSize={11}
              tickFormatter={(value) => 
                value.length > 25 ? `${value.substring(0, 25)}...` : value
              }
            />
            <Bar 
              dataKey="value" 
              fill="var(--color-data)"
              radius={[0, 4, 4, 0]}
            />
            <ChartTooltip 
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-popover text-popover-foreground border border-border/50 rounded-lg p-2 shadow-lg">
                    <p className="font-medium mb-1">{data.name}</p>
                    <p className="text-muted-foreground">
                      {formatCurrency(data.value)}
                    </p>
                  </div>
                );
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Card>
  );
};

export default BoxOfficeChart;