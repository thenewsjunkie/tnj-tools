import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";

const Companion = () => {
  return (
    <Card className="w-full bg-background border border-gray-200 dark:border-white/10">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-foreground" />
            Companion
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <iframe 
          src="http://192.168.1.229:8888/tablet?cols=6&pages=90&rows=3"
          className="w-full h-[500px] border-0 rounded-md"
          title="Bitfocus Companion Interface"
        />
      </CardContent>
    </Card>
  );
};

export default Companion;