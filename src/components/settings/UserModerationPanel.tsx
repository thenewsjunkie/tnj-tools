import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Shield, ShieldX, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

const USERS_PER_PAGE = 20;

type Profile = {
  id: string;
  email: string;
  created_at: string;
  approved_at: string | null;
  status: string;
  role: string;
};

export const UserModerationPanel = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['profiles', currentPage],
    queryFn: async () => {
      const start = (currentPage - 1) * USERS_PER_PAGE;
      const end = start + USERS_PER_PAGE - 1;

      const { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(start, end);

      if (error) throw error;
      return { profiles: data as Profile[], total: count || 0 };
    },
  });

  const totalPages = data ? Math.ceil(data.total / USERS_PER_PAGE) : 0;

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
    refetch();
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
    refetch();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
            {data?.profiles.map((profile) => (
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

      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                />
              </PaginationItem>
            )}
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};