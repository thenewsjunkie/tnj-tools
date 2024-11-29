import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useTheme } from "@/components/theme/ThemeProvider";

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
      <Card className="h-[300px] flex items-center justify-center text-muted-foreground">
        Loading box office data...
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-[300px] flex items-center justify-center text-red-500">
        Error loading box office data
      </Card>
    );
  }

  if (!boxOfficeData?.length) {
    return (
      <Card className="h-[300px] flex items-center justify-center text-muted-foreground">
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
        light: theme === 'light' ? '#4338ca' : '#818cf8',
        dark: theme === 'light' ? '#4338ca' : '#818cf8',
      },
    },
  };

  return (
    <Card className="p-4 h-[300px]">
      <h3 className="text-sm font-semibold mb-4">Weekend Box Office Top 10</h3>
      <ChartContainer className="h-[250px]" config={config}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 0, bottom: 0, left: 100 }}
          >
            <XAxis type="number" tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={90}
              tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
            />
            <Bar dataKey="value" fill="var(--color-data)" />
            <ChartTooltip content={<ChartTooltipContent />} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Card>
  );
};

export default BoxOfficeChart;