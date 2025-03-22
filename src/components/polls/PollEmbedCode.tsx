
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Copy } from "lucide-react";

interface PollEmbedCodeProps {
  pollId: string;
  baseUrl?: string;
}

const PollEmbedCode: React.FC<PollEmbedCodeProps> = ({ 
  pollId,
  baseUrl = window.location.origin 
}) => {
  const { toast } = useToast();
  const embedUrl = `${baseUrl}/poll/${pollId}`;
  
  const iframeCode = `<iframe 
  src="${embedUrl}" 
  width="100%" 
  height="450" 
  frameborder="0" 
  style="border: 1px solid #eaeaea; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);" 
  allowtransparency="true">
</iframe>`;

  const directLinkCode = embedUrl;

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
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Iframe Embed Code</span>
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
            Paste this code into your HTML to embed the poll with full voting functionality.
          </p>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Direct Link</span>
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
            Share this link via email, social media, or anywhere you want users to vote.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PollEmbedCode;
