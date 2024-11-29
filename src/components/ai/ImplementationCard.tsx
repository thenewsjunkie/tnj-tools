import { useState } from "react";
import { Check, Copy, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Implementation {
  filename: string;
  code: string;
  implementation_id: string;
}

interface ImplementationCardProps {
  implementation: Implementation;
}

const ImplementationCard = ({ implementation }: ImplementationCardProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(implementation.code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast({
        title: "Copied!",
        description: `${implementation.filename} code has been copied to clipboard.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy code to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleImplement = async () => {
    try {
      const { error } = await supabase
        .from('code_implementations')
        .update({ status: 'implemented' })
        .eq('id', implementation.implementation_id);

      if (error) throw error;

      toast({
        title: "Implementation Complete",
        description: `Changes for ${implementation.filename} have been implemented.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to implement changes in ${implementation.filename}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 bg-card rounded-lg border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md font-medium">{implementation.filename}</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
          >
            {isCopied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span className="ml-2">
              {isCopied ? "Copied!" : "Copy"}
            </span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleImplement}
          >
            <Code2 className="w-4 h-4 mr-2" />
            Implement
          </Button>
        </div>
      </div>
      <pre className="whitespace-pre-wrap text-sm overflow-x-auto bg-muted p-4 rounded">
        {implementation.code}
      </pre>
    </div>
  );
};

export default ImplementationCard;