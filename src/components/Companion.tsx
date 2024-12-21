import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";

const Companion = () => {
  const [iframeError, setIframeError] = useState(false);

  const handleIframeError = () => {
    console.log("[Companion] Failed to load iframe content");
    setIframeError(true);
  };

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
        {iframeError ? (
          <div className="text-sm text-muted-foreground">
            Unable to connect to Companion. Please ensure:
            <ul className="list-disc pl-4 mt-2">
              <li>Companion is running on your network</li>
              <li>You can access http://192.168.1.229:8888 directly</li>
              <li>You're connected to the correct network</li>
            </ul>
          </div>
        ) : (
          <iframe 
            src="http://192.168.1.229:8888/tablet?cols=6&pages=90&rows=3"
            className="w-full h-[500px] border-0 rounded-md"
            title="Bitfocus Companion Interface"
            onError={handleIframeError}
            allow="fullscreen"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        )}
      </CardContent>
    </Card>
  );
};

export default Companion;