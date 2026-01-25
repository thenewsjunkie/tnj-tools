import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface FindReplaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  text: string;
  onReplace: (newText: string) => void;
}

const FindReplaceDialog = ({ open, onOpenChange, text, onReplace }: FindReplaceDialogProps) => {
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchCount, setMatchCount] = useState(0);

  useEffect(() => {
    if (findText) {
      const regex = new RegExp(escapeRegex(findText), "gi");
      const matches = text.match(regex);
      setMatchCount(matches ? matches.length : 0);
    } else {
      setMatchCount(0);
    }
  }, [findText, text]);

  const escapeRegex = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  const handleReplaceFirst = () => {
    if (!findText) return;
    const regex = new RegExp(escapeRegex(findText), "i");
    const newText = text.replace(regex, replaceText);
    onReplace(newText);
  };

  const handleReplaceAll = () => {
    if (!findText) return;
    const regex = new RegExp(escapeRegex(findText), "gi");
    const newText = text.replace(regex, replaceText);
    onReplace(newText);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Find & Replace</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="find">Find</Label>
            <div className="flex items-center gap-2">
              <Input
                id="find"
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                placeholder="Text to find..."
                autoFocus
              />
              {findText && (
                <Badge variant="secondary" className="whitespace-nowrap">
                  {matchCount} {matchCount === 1 ? "match" : "matches"}
                </Badge>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="replace">Replace with</Label>
            <Input
              id="replace"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="Replacement text..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleReplaceFirst}
              disabled={!findText || matchCount === 0}
            >
              Replace
            </Button>
            <Button
              onClick={handleReplaceAll}
              disabled={!findText || matchCount === 0}
            >
              Replace All
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FindReplaceDialog;
