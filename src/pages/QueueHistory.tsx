import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

const ITEMS_PER_PAGE = 25;

const QueueHistory = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['alert-queue', currentPage],
    queryFn: async () => {
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      
      const { data: queueItems, error, count } = await supabase
        .from('alert_queue')
        .select(`
          *,
          alerts (
            title,
            message_text,
            message_enabled
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(start, start + ITEMS_PER_PAGE - 1);

      if (error) throw error;
      
      return { items: queueItems, total: count || 0 };
    }
  });

  const totalPages = Math.ceil((data?.total || 0) / ITEMS_PER_PAGE);

  const handleStatusUpdate = async (id: string) => {
    const { error } = await supabase
      .from('alert_queue')
      .update({ status: 'completed', played_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error updating status",
        description: error.message
      });
    } else {
      toast({
        title: "Status updated",
        description: "Alert marked as completed"
      });
      refetch();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('alert_queue')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error deleting alert",
        description: error.message
      });
    } else {
      toast({
        title: "Alert deleted",
        description: "Alert removed from queue"
      });
      refetch();
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Alert Queue History</h1>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Alert Type</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Played At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {format(new Date(item.created_at), "MMM d, yyyy HH:mm:ss")}
                </TableCell>
                <TableCell>{item.alerts?.title}</TableCell>
                <TableCell>
                  {item.username && item.alerts?.message_enabled ? (
                    `${item.username} subscribed to ${item.alerts.title}`
                  ) : (
                    item.alerts?.message_text || "No message"
                  )}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={item.status === 'completed' ? 'default' : 'secondary'}
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {item.played_at ? 
                    format(new Date(item.played_at), "MMM d, yyyy HH:mm:ss") : 
                    "Not played"
                  }
                </TableCell>
                <TableCell className="space-x-2">
                  {item.status !== 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusUpdate(item.id)}
                    >
                      Mark Complete
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              />
            </PaginationItem>
            
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
            
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default QueueHistory;