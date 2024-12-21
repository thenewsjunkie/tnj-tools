import { useState, useEffect } from "react";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import type { Alert } from "@/integrations/supabase/types/tables/alerts";

interface TriggerDialogProps {
  trigger?: {
    id: string;
    title: string;
    link: string;
  };
  onSubmit: (title: string, link: string) => void;
}

const TriggerDialog = ({ trigger, onSubmit }: TriggerDialogProps) => {
  const [title, setTitle] = useState("");
  const [selectedAlert, setSelectedAlert] = useState<string>("");
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (trigger) {
      setTitle(trigger.title);
    } else {
      setTitle("");
      setSelectedAlert("");
    }
  }, [trigger]);

  useEffect(() => {
    const fetchAlerts = async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setAlerts(data);
      }
    };

    fetchAlerts();
  }, []);

  const handleSubmit = () => {
    if (!selectedAlert) return;
    
    // Convert alert title to URL-friendly slug
    const selectedAlertData = alerts.find(alert => alert.id === selectedAlert);
    if (!selectedAlertData) return;
    
    const alertSlug = selectedAlertData.title.toLowerCase().replace(/\s+/g, '-');
    const alertUrl = `/alerts/${alertSlug}`;
    
    onSubmit(title || selectedAlertData.title, alertUrl);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="text-foreground dark:text-white">
          {trigger ? 'Edit Trigger' : 'Add New Trigger'}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 pt-4">
        <div className="space-y-2">
          <Select
            value={selectedAlert}
            onValueChange={setSelectedAlert}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an alert" />
            </SelectTrigger>
            <SelectContent>
              {alerts.map((alert) => (
                <SelectItem key={alert.id} value={alert.id}>
                  {alert.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Input
            placeholder="Custom Trigger Title (Optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <Button 
          onClick={handleSubmit}
          className="w-full"
          disabled={!selectedAlert}
        >
          {trigger ? 'Update Trigger' : 'Add Trigger'}
        </Button>
      </div>
    </DialogContent>
  );
};

export default TriggerDialog;