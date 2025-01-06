import { Dialog, DialogContent } from "@/components/ui/dialog";
import AlertDialogHeader from "./dialog/AlertDialogHeader";
import AlertDialogForm from "./dialog/AlertDialogForm";

interface AddAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAlertAdded: () => void;
  isTemplate?: boolean;
  initialType?: 'message' | 'gift' | null;
}

const AddAlertDialog = ({ 
  open, 
  onOpenChange, 
  onAlertAdded,
  isTemplate = false,
  initialType = null
}: AddAlertDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader />
        <AlertDialogForm
          onAlertAdded={onAlertAdded}
          onOpenChange={onOpenChange}
          isTemplate={isTemplate}
          initialType={initialType}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddAlertDialog;