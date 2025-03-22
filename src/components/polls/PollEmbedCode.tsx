
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Copy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PollEmbedCodeProps {
  pollId: string;
}

const PollEmbedCode: React.FC<PollEmbedCodeProps> = ({ pollId }) => {
  const { toast } = useToast();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  
  // Hardcode the domain to tnjtools.com
  const baseUrl = "https://tnjtools.com";
  const embedUrl = `${baseUrl}/poll/${pollId}?theme=${theme}`;
  
  // Create a special URL for the "always latest poll" feature
  const latestPollUrl = `${baseUrl}/poll/latest?theme=${theme}`;
  
  // Standard embed code for specified poll
  const iframeCode = `<iframe 
  src="${embedUrl}" 
  width="100%" 
  height="450" 
  frameborder="0" 
  style="border: 1px solid #eaeaea; border-radius: 8px;" 
  allowtransparency="true">
</iframe>`;

  // Latest poll embed code
  const latestIframeCode = `<iframe 
  src="${latestPollUrl}" 
  width="100%" 
  height="450" 
  frameborder="0" 
  style="border: 1px solid #eaeaea; border-radius: 8px;" 
  allowtransparency="true">
</iframe>`;

  const directLinkCode = embedUrl;
  const latestDirectLinkCode = latestPollUrl;

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: description,
      });
    });
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">Embed this Poll</CardTitle>
        <CardDescription>
          Share this poll on your website or directly with your audience.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="light" className="w-full mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Theme:</span>
            <TabsList>
              <TabsTrigger value="light" onClick={() => setTheme("light")}>Light</TabsTrigger>
              <TabsTrigger value="dark" onClick={() => setTheme("dark")}>Dark</TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">This Specific Poll - Iframe Embed</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => copyToClipboard(iframeCode, "Iframe code copied to clipboard")}
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
          </div>
          <div className="bg-muted p-2 rounded-md">
            <code className="text-xs break-all">{iframeCode}</code>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Paste this code into your HTML to embed this specific poll with full voting functionality.
          </p>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Always Latest Poll - Iframe Embed</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => copyToClipboard(latestIframeCode, "Latest poll iframe code copied to clipboard")}
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
          </div>
          <div className="bg-muted p-2 rounded-md">
            <code className="text-xs break-all">{latestIframeCode}</code>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            This embed will always show your most recent active poll, even as you create new ones.
          </p>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Direct Link to Specific Poll</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => copyToClipboard(directLinkCode, "Direct link copied to clipboard")}
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
          </div>
          <Input value={directLinkCode} readOnly />
          <p className="text-xs text-muted-foreground mt-1">
            Share this link via email, social media, or anywhere you want users to vote on this specific poll.
          </p>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Direct Link to Latest Poll</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => copyToClipboard(latestDirectLinkCode, "Latest poll link copied to clipboard")}
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
          </div>
          <Input value={latestDirectLinkCode} readOnly />
          <p className="text-xs text-muted-foreground mt-1">
            This link will always redirect to your most recent active poll.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PollEmbedCode;
