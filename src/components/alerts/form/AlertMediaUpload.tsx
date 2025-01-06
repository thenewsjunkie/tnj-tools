import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AlertMediaUploadProps {
  isUploading: boolean;
  isMessageAlert: boolean;
}

const AlertMediaUpload = ({ isUploading, isMessageAlert }: AlertMediaUploadProps) => {
  if (isMessageAlert) return null;

  return (
    <div className="space-y-2">
      <Input
        type="file"
        accept="image/gif,video/webm"
        required
        disabled={isUploading}
        className="text-foreground bg-background"
      />
    </div>
  );
};

export default AlertMediaUpload;