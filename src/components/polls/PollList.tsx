
import React from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Play, Pause, Code, ExternalLink } from "lucide-react";

interface PollListProps {
  polls: any[];
  onEdit: (poll: any) => void;
  onShowEmbed?: (pollId: string) => void;
  selectedForEmbed?: string | null;
}

const PollList: React.FC<PollListProps> = ({ 
  polls, 
  onEdit, 
  onShowEmbed,
  selectedForEmbed 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deletePollMutation = useMutation({
    mutationFn: async ({ id, strawpollId }: { id: string; strawpollId?: string | null }) => {
      // If there's a Strawpoll ID, try to delete it from Strawpoll first
      if (strawpollId) {
        try {
          const { data, error } = await supabase.functions.invoke('strawpoll', {
            body: {
              action: 'delete',
              poll_id: strawpollId,
            },
          });
          
          if (error) {
            console.warn('Failed to delete from Strawpoll:', error);
            // Continue with local deletion even if Strawpoll deletion fails
          }
        } catch (err) {
          console.warn('Error deleting from Strawpoll:', err);
        }
      }

      // Delete the options first
      const { error: optionsError } = await supabase
        .from("poll_options")
        .delete()
        .eq("poll_id", id);
        
      if (optionsError) throw optionsError;
      
      // Then delete the poll
      const { error } = await supabase
        .from("polls")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polls"] });
      toast({
        title: "Poll deleted",
        description: "The poll has been deleted from both Strawpoll and locally.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting poll",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  const updatePollStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "active" | "draft" | "completed" }) => {
      const { error } = await supabase
        .from("polls")
        .update({ status })
        .eq("id", id);
        
      if (error) throw error;
      
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polls"] });
      toast({
        title: "Poll status updated",
        description: "The poll status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating poll status",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active": return "default" as const;
      case "draft": return "secondary" as const;
      case "completed": return "outline" as const;
      default: return "secondary" as const;
    }
  };

  if (polls.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <p className="text-muted-foreground">No polls created yet. Create your first poll!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {polls.map((poll) => (
        <Card 
          key={poll.id} 
          className={`overflow-hidden ${selectedForEmbed === poll.id ? 'ring-2 ring-primary' : ''}`}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                {poll.strawpoll_id && (
                  <img 
                    src="https://strawpoll.com/favicon.ico" 
                    alt="Strawpoll" 
                    className="w-4 h-4"
                    title="Hosted on Strawpoll"
                  />
                )}
                <CardTitle className="text-lg">{poll.question}</CardTitle>
              </div>
              <Badge variant={getStatusBadgeVariant(poll.status)}>
                {poll.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mt-2">
              <p className="text-sm text-muted-foreground mb-2">Options:</p>
              <ul className="space-y-1">
                {poll.poll_options.map((option: any) => (
                  <li key={option.id} className="text-sm">
                    • {option.text}
                  </li>
                ))}
              </ul>
              {poll.strawpoll_id && (
                <p className="text-xs text-muted-foreground mt-2 italic">
                  Votes tracked on Strawpoll.com
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap justify-between gap-2 pt-2">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onEdit(poll)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              {poll.status === "active" ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => updatePollStatusMutation.mutate({ id: poll.id, status: "completed" })}
                >
                  <Pause className="h-4 w-4 mr-1" />
                  End
                </Button>
              ) : poll.status === "draft" ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => updatePollStatusMutation.mutate({ id: poll.id, status: "active" })}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Start
                </Button>
              ) : null}
              
              {onShowEmbed && (
                <Button
                  variant={selectedForEmbed === poll.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => onShowEmbed(poll.id)}
                >
                  <Code className="h-4 w-4 mr-1" />
                  Embed
                </Button>
              )}

              {poll.strawpoll_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(poll.strawpoll_url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View
                </Button>
              )}
            </div>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm("Are you sure you want to delete this poll? This will also delete it from Strawpoll.")) {
                  deletePollMutation.mutate({ id: poll.id, strawpollId: poll.strawpoll_id });
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default PollList;
