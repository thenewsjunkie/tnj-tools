
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Video } from "lucide-react";
import { VideoUploadForm } from "./video-bytes/VideoUploadForm";

export function VideoBytes() {
  return (
    <Card className="dark:bg-black/50 dark:border-white/10">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Video Bytes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <VideoUploadForm />
      </CardContent>
    </Card>
  );
}
