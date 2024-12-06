import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QueueStatusProps {
  queuePosition: number;
  estimatedWait: number;
  isConnecting: boolean;
  name: string;
  topic: string;
  onJoinCall: () => void;
}

const QueueStatus = ({ 
  queuePosition, 
  estimatedWait, 
  isConnecting, 
  name, 
  topic, 
  onJoinCall 
}: QueueStatusProps) => {
  return (
    <>
      {queuePosition > 0 ? (
        <div className="bg-primary/10 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <p>
              You're #{queuePosition} in line. Estimated wait: {estimatedWait} minutes
            </p>
          </div>
        </div>
      ) : (
        <Button
          className="w-full py-6 text-lg"
          onClick={onJoinCall}
          disabled={isConnecting || !name || !topic}
        >
          {isConnecting ? "Connecting..." : "Join Call"}
        </Button>
      )}
    </>
  );
};

export default QueueStatus;