import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Common timezone list
const timezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Moscow',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Dubai',
  'Asia/Singapore',
  'Australia/Sydney',
  'Pacific/Auckland'
];

type Profile = {
  id: string;
  email: string;
  timezone: string;
  status: string;
  role: string;
  created_at: string;
};

const Settings = () => {
  const [timezone, setTimezone] = useState("");
  const [loading, setLoading] = useState(true);
  const [pendingUsers, setPendingUsers] = useState<Profile[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          title: "Error",
          description: "You must be logged in to view settings",
          variant: "destructive",
        });
        return;
      }

      // First fetch the profile to get the timezone
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('timezone, role')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      if (profile) {
        setTimezone(profile.timezone);
        
        // Check if user is admin and fetch pending users if they are
        if (profile.role === 'admin') {
          setIsAdmin(true);
          const { data: pendingProfiles, error: pendingError } = await supabase
            .from('profiles')
            .select('*')
            .eq('status', 'pending');

          if (pendingError) {
            console.error('Error fetching pending users:', pendingError);
          } else {
            setPendingUsers(pendingProfiles || []);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTimezone = async (newTimezone: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          title: "Error",
          description: "You must be logged in to update settings",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ timezone: newTimezone })
        .eq('id', session.user.id);

      if (error) {
        console.error('Error updating timezone:', error);
        throw error;
      }

      setTimezone(newTimezone);
      toast({
        title: "Success",
        description: "Timezone updated successfully",
      });
    } catch (error) {
      console.error('Error updating timezone:', error);
      toast({
        title: "Error",
        description: "Failed to update timezone",
        variant: "destructive",
      });
    }
  };

  const approveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User approved successfully",
      });
      
      // Refresh the pending users list
      const { data: pendingProfiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'pending');

      setPendingUsers(pendingProfiles || []);
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        title: "Error",
        description: "Failed to approve user",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Time Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={timezone} onValueChange={updateTimezone}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select your timezone" />
            </SelectTrigger>
            <SelectContent>
              {timezones.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>User Moderation</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingUsers.length === 0 ? (
              <p className="text-muted-foreground">No pending users</p>
            ) : (
              <div className="space-y-4">
                {pendingUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{user.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button onClick={() => approveUser(user.id)}>
                      Approve
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Settings;