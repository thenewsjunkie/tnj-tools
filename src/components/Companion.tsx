import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Companion = () => {
  const [iframeError, setIframeError] = useState(false);

  const handleIframeError = () => {
    console.log("[Companion] Failed to load iframe content due to mixed content restrictions");
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
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Security Restriction</AlertTitle>
            <AlertDescription className="mt-2">
              Unable to load Companion due to browser security restrictions. To resolve this:
              <ul className="list-disc pl-4 mt-2 space-y-1">
                <li>Access this page using HTTP instead of HTTPS (locally)</li>
                <li>Or configure Companion to use HTTPS (recommended)</li>
                <li>Or access Companion directly at: <a 
                    href="http://192.168.1.229:8888/tablet?cols=6&pages=90&rows=3" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    http://192.168.1.229:8888
                  </a>
                </li>
              </ul>
            </AlertDescription>
          </Alert>
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