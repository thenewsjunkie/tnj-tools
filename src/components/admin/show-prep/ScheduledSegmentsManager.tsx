import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Settings } from "lucide-react";
import { toast } from "sonner";
import ScheduledSegmentDialog from "./ScheduledSegmentDialog";

interface ScheduledSegment {
  id: string;
  name: string;
  time: string;
  hour_block: string;
  days: number[];
  is_active: boolean;
}

const DAY_NAMES: Record<number, string> = {
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
};

const HOUR_LABELS: Record<string, string> = {
  "hour-1": "Hour 1",
  "hour-2": "Hour 2",
  "hour-3": "Hour 3",
  "hour-4": "Hour 4",
};

const formatDays = (days: number[]): string => {
  if (days.length === 5) return "Mon-Fri";
  return days.map(d => DAY_NAMES[d]).join(", ");
};

const ScheduledSegmentsManager = () => {
  const [managerOpen, setManagerOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<ScheduledSegment | null>(null);
  const queryClient = useQueryClient();

  const { data: segments = [], isLoading } = useQuery({
    queryKey: ["scheduled-segments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scheduled_segments")
        .select("*")
        .order("hour_block")
        .order("time");
      if (error) throw error;
      return data as ScheduledSegment[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (segment: Omit<ScheduledSegment, 'id'> & { id?: string }) => {
      if (segment.id) {
        const { error } = await supabase
          .from("scheduled_segments")
          .update({
            name: segment.name,
            time: segment.time,
            hour_block: segment.hour_block,
            days: segment.days,
            is_active: segment.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq("id", segment.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("scheduled_segments")
          .insert({
            name: segment.name,
            time: segment.time,
            hour_block: segment.hour_block,
            days: segment.days,
            is_active: segment.is_active,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-segments"] });
      toast.success(editingSegment ? "Segment updated" : "Segment added");
      setEditingSegment(null);
    },
    onError: () => {
      toast.error("Failed to save segment");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("scheduled_segments")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-segments"] });
      toast.success("Segment deleted");
    },
    onError: () => {
      toast.error("Failed to delete segment");
    },
  });

  const handleEdit = (segment: ScheduledSegment) => {
    setEditingSegment(segment);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingSegment(null);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this segment?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setManagerOpen(true)}
        className="h-8 w-8"
        title="Manage Scheduled Segments"
      >
        <Settings className="h-4 w-4" />
      </Button>

      <Dialog open={managerOpen} onOpenChange={setManagerOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Scheduled Segments</DialogTitle>
          </DialogHeader>

          <div className="flex justify-end mb-4">
            <Button size="sm" onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-1" />
              Add Segment
            </Button>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : segments.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No scheduled segments yet. Add one to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-foreground">Name</TableHead>
                  <TableHead className="text-foreground">Time</TableHead>
                  <TableHead className="text-foreground">Hour</TableHead>
                  <TableHead className="text-foreground">Days</TableHead>
                  <TableHead className="text-foreground w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {segments.map((segment) => (
                  <TableRow key={segment.id} className={!segment.is_active ? "opacity-50" : ""}>
                    <TableCell className="font-medium text-foreground">{segment.name}</TableCell>
                    <TableCell className="text-foreground">{segment.time}</TableCell>
                    <TableCell className="text-foreground">{HOUR_LABELS[segment.hour_block] || segment.hour_block}</TableCell>
                    <TableCell className="text-foreground">{formatDays(segment.days)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleEdit(segment)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(segment.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      <ScheduledSegmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        segment={editingSegment}
        onSave={(segment) => saveMutation.mutate(segment)}
      />
    </>
  );
};

export default ScheduledSegmentsManager;
