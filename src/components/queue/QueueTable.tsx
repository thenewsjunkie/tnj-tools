import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface QueueTableProps {
  items: any[];
  onStatusUpdate: (id: string) => void;
  onDelete: (id: string) => void;
}

export const QueueTable = ({ items, onStatusUpdate, onDelete }: QueueTableProps) => {
  return (
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
        {items.map((item) => (
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
                  onClick={() => onStatusUpdate(item.id)}
                >
                  Mark Complete
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};