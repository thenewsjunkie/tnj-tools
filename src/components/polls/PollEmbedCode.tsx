
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Copy, ExternalLink } from "lucide-react";

interface PollEmbedCodeProps {
  pollId: string;
  strawpollId?: string | null;
  strawpollUrl?: string | null;
  strawpollEmbedUrl?: string | null;
}

const PollEmbedCode: React.FC<PollEmbedCodeProps> = ({ 
  pollId, 
  strawpollId,
  strawpollUrl,
  strawpollEmbedUrl 
}) => {
  const { toast } = useToast();
  
  // Use Strawpoll embed if available, otherwise fall back to internal
  const hasStrawpoll = !!strawpollId && !!strawpollEmbedUrl;
  
  // Strawpoll embed code
  const strawpollIframeCode = hasStrawpoll 
    ? `<iframe 
  src="${strawpollEmbedUrl}" 
  width="100%" 
  height="400" 
  style="border: 0; border-radius: 8px;" 
  allowfullscreen>
</iframe>`
    : null;

  // Fallback internal embed (for legacy polls without Strawpoll)
  const baseUrl = "https://tnjtools.com";
  const internalEmbedUrl = `${baseUrl}/poll/${pollId}?theme=light`;
  const internalIframeCode = `<iframe 
  src="${internalEmbedUrl}" 
  width="100%" 
  height="450" 
  frameborder="0" 
  style="border: 1px solid #eaeaea; border-radius: 8px;" 
  allowtransparency="true">
</iframe>`;

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
        <CardTitle className="text-lg flex items-center gap-2">
          {hasStrawpoll && (
            <img 
              src="https://strawpoll.com/favicon.ico" 
              alt="Strawpoll" 
              className="w-5 h-5"
            />
          )}
          Embed this Poll
        </CardTitle>
        <CardDescription>
          {hasStrawpoll 
            ? "This poll is hosted on Strawpoll.com with IP-based duplicate prevention."
            : "Share this poll on your website or directly with your audience."
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasStrawpoll ? (
          <>
            {/* Strawpoll Embed Code */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Strawpoll Embed Code</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => copyToClipboard(strawpollIframeCode!, "Strawpoll embed code copied to clipboard")}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
              <div className="bg-muted p-2 rounded-md">
                <code className="text-xs break-all">{strawpollIframeCode}</code>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Paste this code into your HTML to embed the Strawpoll with full voting functionality.
              </p>
            </div>

            {/* Strawpoll Direct Link */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Strawpoll Direct Link</span>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyToClipboard(strawpollUrl!, "Strawpoll link copied to clipboard")}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(strawpollUrl!, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open
                  </Button>
                </div>
              </div>
              <Input value={strawpollUrl!} readOnly />
              <p className="text-xs text-muted-foreground mt-1">
                Share this link directly - users can vote on Strawpoll.com
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Legacy Internal Embed */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Internal Embed Code</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => copyToClipboard(internalIframeCode, "Iframe code copied to clipboard")}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
              <div className="bg-muted p-2 rounded-md">
                <code className="text-xs break-all">{internalIframeCode}</code>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                This is a legacy poll without Strawpoll integration. Consider recreating it to use Strawpoll.
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Direct Link</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => copyToClipboard(internalEmbedUrl, "Direct link copied to clipboard")}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
              <Input value={internalEmbedUrl} readOnly />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PollEmbedCode;
