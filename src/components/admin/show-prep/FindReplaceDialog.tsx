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
import type { Editor } from "@tiptap/react";

interface FindReplaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editor: Editor | null;
  onReplace: (newHtml: string) => void;
}

const FindReplaceDialog = ({ open, onOpenChange, editor, onReplace }: FindReplaceDialogProps) => {
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchCount, setMatchCount] = useState(0);

  // Get plain text from editor for searching
  const text = editor?.getText() || "";

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
    if (!findText || !editor) return;
    
    // Get HTML and replace first occurrence
    const html = editor.getHTML();
    const regex = new RegExp(escapeRegex(findText), "i");
    const newHtml = html.replace(regex, replaceText);
    onReplace(newHtml);
  };

  const handleReplaceAll = () => {
    if (!findText || !editor) return;
    
    // Get HTML and replace all occurrences
    const html = editor.getHTML();
    const regex = new RegExp(escapeRegex(findText), "gi");
    const newHtml = html.replace(regex, replaceText);
    onReplace(newHtml);
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
