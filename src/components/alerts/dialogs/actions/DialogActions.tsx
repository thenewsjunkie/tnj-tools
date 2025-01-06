import { Button } from "@/components/ui/button";

interface DialogActionsProps {
  isPreviewMode: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onPreview: () => void;
  onEdit: () => void;
  onSubmit: () => void;
}

const DialogActions = ({
  isPreviewMode,
  isSubmitting,
  onCancel,
  onPreview,
  onEdit,
  onSubmit
}: DialogActionsProps) => {
  return (
    <div className="flex justify-end gap-3 mt-4 sticky bottom-0 bg-background py-4">
      <Button 
        variant="outline" 
        onClick={onCancel}
        className="bg-card text-card-foreground border-input hover:bg-accent"
      >
        Cancel
      </Button>
      {!isPreviewMode ? (
        <Button 
          onClick={onPreview}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Preview
        </Button>
      ) : (
        <>
          <Button 
            variant="outline"
            onClick={onEdit}
            className="bg-card text-card-foreground border-input hover:bg-accent"
          >
            Edit
          </Button>
          <Button 
            onClick={onSubmit} 
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Queue Alert
          </Button>
        </>
      )}
    </div>
  );
};

export default DialogActions;