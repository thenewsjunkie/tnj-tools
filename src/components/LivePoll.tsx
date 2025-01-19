import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";

const LivePoll = () => {
  const { theme } = useTheme();
  const bgColor = theme === 'light' ? 'bg-white' : 'bg-black/50';

  return (
    <Card className={`${bgColor} border border-gray-200 dark:border-white/10`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Live Poll
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground text-center py-8">
          Live poll feature coming soon...
        </div>
      </CardContent>
    </Card>
  );
};

export default LivePoll;