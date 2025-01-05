import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { QueueTable } from "@/components/queue/QueueTable";
import { QueuePagination } from "@/components/queue/QueuePagination";
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
    return <div className="flex justify-center items-center min-h-screen bg-background text-foreground">Loading...</div>;
  }

  const totalPages = Math.ceil((data?.total || 0) / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <nav className="mb-8">
          <Link 
            to="/admin" 
            className="text-foreground hover:text-neon-red transition-colors"
          >
            ← Admin
          </Link>
        </nav>
        
        <h1 className="text-2xl font-bold mb-6 text-foreground">Alert Queue History</h1>
        
        <div className="rounded-md border border-border bg-card">
          <QueueTable 
            items={data?.items || []}
            onStatusUpdate={handleStatusUpdate}
            onDelete={handleDelete}
          />
        </div>

        <div className="mt-4">
          <QueuePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default QueueHistory;