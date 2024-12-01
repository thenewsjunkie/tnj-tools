import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RotateCcw, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CodeVersion {
  id: string;
  commit_hash: string;
  commit_message: string;
  changes: any;
  created_at: string;
  status: string;
  prompt: string;
  branch_name: string;
}

const VersionHistory = () => {
  const [versions, setVersions] = useState<CodeVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchVersions();
  }, []);

  const fetchVersions = async () => {
    try {
      const { data, error } = await supabase
        .from('code_versions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch version history.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRollback = async (version: CodeVersion) => {
    try {
      const { error } = await supabase.functions.invoke('gpt-engineer', {
        body: { 
          rollback: true,
          commitHash: version.commit_hash,
          branchName: version.branch_name
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully rolled back to previous version.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to roll back to previous version.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading version history...</div>;
  }

  return (
    <div className="space-y-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Commit Message</TableHead>
            <TableHead>Branch</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {versions.map((version) => (
            <TableRow key={version.id}>
              <TableCell>
                {new Date(version.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>{version.commit_message}</TableCell>
              <TableCell>{version.branch_name}</TableCell>
              <TableCell>{version.status}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Version Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium mb-2">Prompt</h3>
                          <p className="text-sm">{version.prompt}</p>
                        </div>
                        <div>
                          <h3 className="font-medium mb-2">Changes</h3>
                          <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                            {JSON.stringify(version.changes, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleRollback(version)}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default VersionHistory;