import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Shield,
  ShieldX,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

type Profile = {
  id: string;
  email: string;
  created_at: string;
  approved_at: string | null;
  status: string;
  role: string;
};

export const UserModeration = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching profiles:", error);
      toast({
        title: "Error",
        description: "Failed to fetch user profiles",
        variant: "destructive",
      });
      return;
    }

    setProfiles(data || []);
  };

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
    fetchProfiles();
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
    fetchProfiles();
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5" />
        <h3 className="text-lg font-semibold">User Moderation</h3>
      </div>

      <div className="rounded-md border dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow className="dark:border-gray-700">
              <TableHead className="dark:text-gray-300">Email</TableHead>
              <TableHead className="dark:text-gray-300">Status</TableHead>
              <TableHead className="dark:text-gray-300">Role</TableHead>
              <TableHead className="dark:text-gray-300">Joined</TableHead>
              <TableHead className="dark:text-gray-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((profile) => (
              <TableRow key={profile.id} className="dark:border-gray-700">
                <TableCell className="dark:text-gray-300">{profile.email}</TableCell>
                <TableCell className="dark:text-gray-300">
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
                <TableCell className="dark:text-gray-300">{profile.role}</TableCell>
                <TableCell className="dark:text-gray-300">
                  {format(new Date(profile.created_at), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="dark:text-gray-300">
                  {profile.status === "pending" && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApprove(profile.id)}
                        className="text-green-500 hover:text-green-600 dark:hover:bg-green-950 dark:border-green-800"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeny(profile.id)}
                        className="text-red-500 hover:text-red-600 dark:hover:bg-red-950 dark:border-red-800"
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