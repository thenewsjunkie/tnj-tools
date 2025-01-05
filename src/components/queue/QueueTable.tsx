import { Redo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QueueTableProps {
  items: any[];
  onStatusUpdate: (id: string) => void;
  onDelete: (id: string) => void;
}

export const QueueTable = ({ items, onStatusUpdate, onDelete }: QueueTableProps) => {
  const { toast } = useToast();

  const handleRequeue = async (item: any) => {
    try {
      const { error } = await supabase
        .from('alert_queue')
        .insert({
          alert_id: item.alert_id,
          username: item.username,
          gift_count: item.gift_count,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Alert requeued",
        description: "The alert has been added back to the queue"
      });
    } catch (error) {
      console.error('Error requeueing alert:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to requeue alert"
      });
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-2 text-left text-muted-foreground font-medium">Status</th>
            <th className="px-4 py-2 text-left text-muted-foreground font-medium">Alert</th>
            <th className="px-4 py-2 text-left text-muted-foreground font-medium">Username</th>
            <th className="px-4 py-2 text-left text-muted-foreground font-medium">Created</th>
            <th className="px-4 py-2 text-left text-muted-foreground font-medium">Played</th>
            <th className="px-4 py-2 text-left text-muted-foreground font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors">
              <td className="px-4 py-2 text-foreground">{item.status}</td>
              <td className="px-4 py-2 text-foreground">{item.alerts?.title}</td>
              <td className="px-4 py-2 text-foreground">{item.username}</td>
              <td className="px-4 py-2 text-foreground">
                {new Date(item.created_at).toLocaleString()}
              </td>
              <td className="px-4 py-2 text-foreground">
                {item.played_at ? new Date(item.played_at).toLocaleString() : '-'}
              </td>
              <td className="px-4 py-2 space-x-2">
                {item.status === 'pending' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStatusUpdate(item.id)}
                  >
                    Mark Complete
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(item.id)}
                >
                  Delete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRequeue(item)}
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};