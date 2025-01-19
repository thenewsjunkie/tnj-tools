import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3, ExternalLink, History } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CreatePollDialog from "./polls/CreatePollDialog";
import ActivePoll from "./polls/ActivePoll";

export function LivePoll() {
  const handlePollCreated = () => {
    // Refresh will happen automatically through the subscription
  };

  return (
    <Card className="dark:bg-black/50 dark:border-white/10">
      <CardHeader className="pb-4">
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Live Poll
          </div>
          <div className="flex items-center gap-2">
            <CreatePollDialog onPollCreated={handlePollCreated} />
            <Link to="/admin/polls">
              <Button
                variant="outline"
                size="icon"
                className="alert-icon hover:text-neon-red dark:hover:bg-white/10 dark:border-white/10"
              >
                <History className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/polls/obs">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 dark:hover:bg-white/10"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ActivePoll />
      </CardContent>
    </Card>
  );
}