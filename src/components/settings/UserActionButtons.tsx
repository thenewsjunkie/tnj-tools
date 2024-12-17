import { CheckCircle2, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserActionButtonsProps {
  userId: string;
  status: string;
  onApprove: (userId: string) => Promise<void>;
  onDeny: (userId: string) => Promise<void>;
}

export const UserActionButtons = ({ userId, status, onApprove, onDeny }: UserActionButtonsProps) => {
  if (status !== "pending") return null;

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => onApprove(userId)}
        className="text-green-500 hover:text-green-600 hover:bg-green-50"
      >
        <CheckCircle2 className="h-4 w-4 mr-1" />
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onDeny(userId)}
        className="text-red-500 hover:text-red-600 hover:bg-red-50"
      >
        <ShieldX className="h-4 w-4 mr-1" />
        Deny
      </Button>
    </div>
  );
};