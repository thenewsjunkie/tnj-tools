import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Link2 } from "lucide-react";
import { Topic } from "./types";
import { normalizeUrl } from "@/lib/url";

interface AddTopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (topic: Topic) => void;
}

const AddTopicDialog = ({ open, onOpenChange, onAdd }: AddTopicDialogProps) => {
  const [type, setType] = useState<"topic" | "link">("topic");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  const handleAdd = () => {
    if (!title.trim()) return;
    if (type === "link" && !url.trim()) return;

    // Normalize URL for link types
    const normalizedUrl = type === "link" ? normalizeUrl(url) : undefined;
    if (type === "link" && !normalizedUrl) return;

    const newTopic: Topic = {
      id: uuidv4(),
      title: title.trim(),
      display_order: 0, // Will be set by parent
      bullets: [{ id: uuidv4(), text: "", indent: 0 }],
      links: [],
      images: [],
      type,
      url: normalizedUrl,
    };

    onAdd(newTopic);
    handleClose();
  };

  const urlError = type === "link" && url.trim() && !normalizeUrl(url);

  const handleClose = () => {
    setTitle("");
    setUrl("");
    setType("topic");
    onOpenChange(false);
  };

  const isValid = title.trim() && (type === "topic" || (url.trim() && !urlError));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Topic</DialogTitle>
        </DialogHeader>

        <Tabs value={type} onValueChange={(v) => setType(v as "topic" | "link")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="topic" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Topic
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="topic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="topic-title">Title</Label>
              <Input
                id="topic-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter topic title..."
                onKeyDown={(e) => e.key === "Enter" && isValid && handleAdd()}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Creates a full topic with a resources page for links, images, and notes.
            </p>
          </TabsContent>

          <TabsContent value="link" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="link-title">Title</Label>
              <Input
                id="link-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter link title..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                onKeyDown={(e) => e.key === "Enter" && isValid && handleAdd()}
                className={urlError ? "border-destructive" : ""}
              />
              {urlError && (
                <p className="text-xs text-destructive">Please enter a valid URL</p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Creates a simple link that opens in a new window when clicked.
            </p>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!isValid}>
            Add {type === "link" ? "Link" : "Topic"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTopicDialog;
