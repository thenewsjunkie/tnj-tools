import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
  LogOut,
  ArrowLeft,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

type Profile = {
  id: string;
  email: string;
  created_at: string;
  approved_at: string | null;
  status: string;
  role: string;
};

const Settings = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <nav className="flex justify-between items-center mb-8">
        <Link
          to="/admin"
          className="text-foreground hover:text-primary transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Admin
        </Link>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
            <p className="text-sm text-muted-foreground">
              Manage user access and application settings
            </p>
          </div>
        </div>

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
      </div>
    </div>
  );
};

export default Settings;