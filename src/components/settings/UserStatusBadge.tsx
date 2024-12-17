import { CheckCircle2, XCircle, Shield } from "lucide-react";

interface UserStatusBadgeProps {
  status: string;
}

export const UserStatusBadge = ({ status }: UserStatusBadgeProps) => (
  <div className="flex items-center gap-2">
    {status === "approved" ? (
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    ) : status === "denied" ? (
      <XCircle className="h-4 w-4 text-red-500" />
    ) : (
      <Shield className="h-4 w-4 text-yellow-500" />
    )}
    {status}
  </div>
);