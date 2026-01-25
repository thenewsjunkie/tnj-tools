import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Copy, Play, Square, ExternalLink, Edit, Trash2 } from "lucide-react";
import PollDialog from "@/components/polls/PollDialog";

interface PollData {
  id: string;
  question: string;
  status: "draft" | "active" | "completed";
  strawpoll_id?: string | null;
  strawpoll_url?: string | null;
  strawpoll_embed_url?: string | null;
  poll_options: { id: string; text: string; votes: number }[];
}

const AdminPolls = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPoll, setEditingPoll] = useState<PollData | null>(null);

  const { data: polls = [], isLoading } = useQuery({
    queryKey: ["polls"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("polls")
        .select("*, poll_options(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as PollData[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ pollId, status }: { pollId: string; status: "draft" | "active" | "completed" }) => {
      const { error } = await supabase
        .from("polls")
        .update({ status })
        .eq("id", pollId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polls"] });
      toast({ title: "Poll status updated" });
    },
    onError: (error) => {
      toast({ title: "Error updating poll", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (pollId: string) => {
      const { error } = await supabase.from("polls").delete().eq("id", pollId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polls"] });
      toast({ title: "Poll deleted" });
    },
    onError: (error) => {
      toast({ title: "Error deleting poll", description: error.message, variant: "destructive" });
    },
  });

  const handleCopyLatestEmbed = () => {
    const embedCode = `<iframe src="https://tnjtools.com/poll/latest" width="100%" height="400" style="border: 0; border-radius: 8px;" allowfullscreen></iframe>`;
    navigator.clipboard.writeText(embedCode);
    toast({ title: "Embed code copied!", description: "Dynamic latest poll embed code copied to clipboard" });
  };

  const handleCopyPollEmbed = (poll: PollData) => {
    const embedCode = poll.strawpoll_embed_url
      ? `<iframe src="${poll.strawpoll_embed_url}" width="100%" height="400" style="border: 0; border-radius: 8px;" allowfullscreen></iframe>`
      : `<iframe src="https://tnjtools.com/poll/${poll.id}" width="100%" height="400" style="border: 0; border-radius: 8px;"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    toast({ title: "Embed code copied!" });
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "outline" => {
    switch (status) {
      case "active": return "default";
      case "draft": return "secondary";
      case "completed": return "outline";
      default: return "secondary";
    }
  };

  const handleEdit = (poll: PollData) => {
    setEditingPoll(poll);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingPoll(null);
    setDialogOpen(true);
  };

  if (isLoading) {
    return <div className="text-muted-foreground text-sm">Loading polls...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={handleCreate} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Create Poll
        </Button>
        <Button onClick={handleCopyLatestEmbed} variant="outline" size="sm" className="gap-1.5">
          <Copy className="h-4 w-4" />
          Copy Latest Embed
        </Button>
      </div>

      {/* Polls Grid */}
      {polls.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No polls yet. Create your first poll!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {polls.map((poll) => (
            <div
              key={poll.id}
              className="p-3 bg-muted/30 rounded-lg border border-border/50"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  {poll.strawpoll_id && (
                    <img
                      src="https://strawpoll.com/favicon.ico"
                      alt="Strawpoll"
                      className="w-4 h-4 flex-shrink-0"
                    />
                  )}
                  <span className="font-medium text-sm truncate" title={poll.question}>
                    {poll.question}
                  </span>
                </div>
                <Badge variant={getStatusBadgeVariant(poll.status)} className="text-xs flex-shrink-0">
                  {poll.status}
                </Badge>
              </div>

              <div className="flex items-center gap-1 flex-wrap">
                {poll.status === "draft" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    onClick={() => updateStatusMutation.mutate({ pollId: poll.id, status: "active" })}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Start
                  </Button>
                )}
                {poll.status === "active" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    onClick={() => updateStatusMutation.mutate({ pollId: poll.id, status: "completed" })}
                  >
                    <Square className="h-3 w-3 mr-1" />
                    End
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs"
                  onClick={() => handleCopyPollEmbed(poll)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                {poll.strawpoll_url && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    asChild
                  >
                    <a href={poll.strawpoll_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs"
                  onClick={() => handleEdit(poll)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                  onClick={() => deleteMutation.mutate(poll.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <PollDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        poll={editingPoll}
      />
    </div>
  );
};

export default AdminPolls;
