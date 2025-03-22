import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, Copy } from "lucide-react";
import PollList from "@/components/polls/PollList";
import PollDialog from "@/components/polls/PollDialog";
import PollEmbedCode from "@/components/polls/PollEmbedCode";
import { Link } from "react-router-dom";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";

const ManagePolls = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activePoll, setActivePoll] = useState<any>(null);
  const [selectedPollForEmbed, setSelectedPollForEmbed] = useState<string | null>(null);

  const { data: polls = [], isLoading } = useQuery({
    queryKey: ["polls"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("polls")
        .select("*, poll_options(*)")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error fetching polls",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      return data;
    },
  });

  const handleCreatePoll = () => {
    setActivePoll(null);
    setIsDialogOpen(true);
  };

  const handleEditPoll = (poll: any) => {
    setActivePoll(poll);
    setIsDialogOpen(true);
  };

  const handleShowEmbedCode = (pollId: string) => {
    setSelectedPollForEmbed(selectedPollForEmbed === pollId ? null : pollId);
  };

  const getLatestActivePoll = () => {
    if (!polls || polls.length === 0) return null;
    return polls.find(poll => poll.status === "active") || null;
  };

  const handleCopyLatestPollEmbed = () => {
    const latestPoll = getLatestActivePoll();
    if (!latestPoll) {
      toast({
        title: "No active poll",
        description: "There are no active polls to embed. Please activate a poll first.",
        variant: "destructive",
      });
      return;
    }

    const baseUrl = "https://tnjtools.com";
    const latestPollUrl = `${baseUrl}/poll/latest?theme=light`;
    const iframeCode = `<iframe 
  src="${latestPollUrl}" 
  width="100%" 
  height="450" 
  frameborder="0" 
  style="border: 1px solid #eaeaea; border-radius: 8px;" 
  allowtransparency="true">
</iframe>`;

    navigator.clipboard.writeText(iframeCode).then(() => {
      toast({
        title: "Latest Poll Embed Code Copied!",
        description: `Embed code for the latest poll copied to clipboard. This will always show your most recent active poll.`,
      });
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Admin
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Polls</h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              onClick={handleCopyLatestPollEmbed}
              className="flex items-center gap-2 mr-2 border border-input"
            >
              <Copy className="h-4 w-4" />
              <span className="whitespace-nowrap">Copy Latest Poll Embed</span>
            </Button>
            <Button onClick={handleCreatePoll} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Create Poll</span>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <p className="text-muted-foreground">Loading polls...</p>
          </div>
        ) : (
          <>
            <PollList 
              polls={polls} 
              onEdit={handleEditPoll}
              onShowEmbed={handleShowEmbedCode}
              selectedForEmbed={selectedPollForEmbed}
            />
            
            {selectedPollForEmbed && (
              <div className="mt-6">
                <PollEmbedCode pollId={selectedPollForEmbed} />
              </div>
            )}
          </>
        )}

        <PollDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          poll={activePoll}
        />
      </div>
    </div>
  );
};

export default ManagePolls;
