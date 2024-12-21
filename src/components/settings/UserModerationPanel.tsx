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

const USERS_PER_PAGE = 20;

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

      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }

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
        <Shield className="h-5 w-5 dark:text-white" />
        <h3 className="text-lg font-semibold dark:text-white">User Moderation</h3>
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