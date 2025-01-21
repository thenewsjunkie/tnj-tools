import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export function LivePoll() {
  return (
    <Card className="dark:bg-black/50 dark:border-white/10">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          New Feature
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground text-center py-8">
          Coming soon
        </div>
      </CardContent>
    </Card>
  );
}