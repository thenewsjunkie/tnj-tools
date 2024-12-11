import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AddAlertDialog from "./alerts/AddAlertDialog";
import AlertButton from "./alerts/AlertButton";
import { useQuery } from "@tanstack/react-query";

const Alerts = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: alerts, refetch } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const handleAlertAdded = () => {
    refetch();
    setIsDialogOpen(false);
    toast({
      title: "Success",
      description: "Alert added successfully",
    });
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">Alerts</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDialogOpen(true)}
            className="text-white hover:text-primary hover:bg-white/10"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="p-6 pt-0 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {alerts?.map((alert) => (
          <AlertButton key={alert.id} alert={alert} />
        ))}
      </div>
      <AddAlertDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAlertAdded={handleAlertAdded}
      />
    </div>
  );
};

export default Alerts;