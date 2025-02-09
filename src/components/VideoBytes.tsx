
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Video, Plus } from "lucide-react";
import { VideoUploadForm } from "./video-bytes/VideoUploadForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

export function VideoBytes() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Card className="dark:bg-black/50 dark:border-white/10">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Video Bytes
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDialogOpen(true)}
            className="h-8 w-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Content will go here */}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Video</DialogTitle>
          </DialogHeader>
          <VideoUploadForm onSuccess={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
