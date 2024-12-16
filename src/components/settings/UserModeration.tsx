import { Shield, ShieldX, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  email: string;
  created_at: string;
  approved_at: string | null;
  status: string;
  role: string;
}

interface UserModerationProps {
  profiles: Profile[];
  onUpdate: () => void;
}

export const UserModeration = ({ profiles, onUpdate }: UserModerationProps) => {
  const { toast } = useToast();

  const handleApprove = async (userId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("Error approving user:", error);
      toast({
        title: "Error",
        description: "Failed to approve user",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "User has been approved",
    });
    onUpdate();
  };

  const handleDeny = async (userId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({
        status: "denied",
      })
      .eq("id", userId);

    if (error) {
      console.error("Error denying user:", error);
      toast({
        title: "Error",
        description: "Failed to deny user",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "User has been denied",
    });
    onUpdate();
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5" />
        <h3 className="text-lg font-semibold">User Moderation</h3>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell>{profile.email}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {profile.status === "approved" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : profile.status === "denied" ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Shield className="h-4 w-4 text-yellow-500" />
                    )}
                    {profile.status}
                  </div>
                </TableCell>
                <TableCell>{profile.role}</TableCell>
                <TableCell>
                  {format(new Date(profile.created_at), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  {profile.status === "pending" && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApprove(profile.id)}
                        className="text-green-500 hover:text-green-600 hover:bg-green-50"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeny(profile.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <ShieldX className="h-4 w-4 mr-1" />
                        Deny
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};