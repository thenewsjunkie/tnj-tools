import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3, ExternalLink, History } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CreatePollDialog from "./polls/CreatePollDialog";
import ActivePoll from "./polls/ActivePoll";

const LivePoll = () => {
  const { theme } = useTheme();
  const bgColor = theme === 'light' ? 'bg-white' : 'bg-black/50';

  const handlePollCreated = () => {
    // Refresh will happen automatically through the subscription
  };

  return (
    <Card className={`${bgColor} border border-gray-200 dark:border-white/10`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Live Poll
        </CardTitle>
        <div className="flex items-center gap-2">
          <CreatePollDialog onPollCreated={handlePollCreated} />
          <Link to="/polls">
            <Button
              variant="outline"
              size="icon"
              className="alert-icon hover:text-neon-red hover:bg-white/10"
            >
              <History className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/polls/obs">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <ActivePoll />
      </CardContent>
    </Card>
  );
};

export default LivePoll;