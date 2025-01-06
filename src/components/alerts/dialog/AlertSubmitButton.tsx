import { Button } from "@/components/ui/button";

interface AlertSubmitButtonProps {
  isUploading: boolean;
}

const AlertSubmitButton = ({ isUploading }: AlertSubmitButtonProps) => {
  return (
    <div className="sticky bottom-0 pt-4 bg-background/95 backdrop-blur">
      <Button 
        type="submit" 
        className="w-full bg-primary text-black hover:bg-primary/90" 
        disabled={isUploading}
      >
        {isUploading ? "Uploading..." : "Add Alert"}
      </Button>
    </div>
  );
};

export default AlertSubmitButton;