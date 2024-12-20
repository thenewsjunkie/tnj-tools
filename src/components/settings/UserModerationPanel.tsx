import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Shield } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { UsersTable } from "./UsersTable";
import type { Profile } from "./types";
import { useAuth } from "@/hooks/useAuth";

const USERS_PER_PAGE = 20;

export const UserModerationPanel = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const { session } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['profiles', currentPage],
    queryFn: async () => {
      if (!session?.user) {
        throw new Error('Not authenticated');
      }

      // First check if the current user is an admin
      const { data: currentUserProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        throw new Error('Error fetching user role');
      }

      if (currentUserProfile.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }

      const start = (currentPage - 1) * USERS_PER_PAGE;
      const end = start + USERS_PER_PAGE - 1;

      const { data, error: fetchError, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(start, end);

      if (fetchError) {
        console.error('Error fetching profiles:', fetchError);
        throw fetchError;
      }

      return { profiles: data as Profile[], total: count || 0 };
    },
    enabled: !!session?.user,
  });

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

  if (!session?.user) {
    return (
      <div className="border rounded-lg p-4">
        <div className="text-center text-muted-foreground">
          Please sign in to access the moderation panel
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-lg p-4">
        <div className="text-center text-destructive">
          {error instanceof Error ? error.message : 'An error occurred'}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="border rounded-lg p-4">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const totalPages = data ? Math.ceil(data.total / USERS_PER_PAGE) : 0;

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5" />
        <h3 className="text-lg font-semibold">User Moderation</h3>
      </div>

      <UsersTable
        profiles={data?.profiles || []}
        onApprove={handleApprove}
        onDeny={handleDeny}
      />

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