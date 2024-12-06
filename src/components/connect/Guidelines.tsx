import { Info, Shield } from "lucide-react";

const Guidelines = () => {
  return (
    <>
      <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Guidelines</h3>
        </div>
        <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
          <li>Ensure you're in a quiet environment</li>
          <li>Use headphones to prevent echo</li>
          <li>Stay on topic and be respectful</li>
          <li>Follow the host's instructions</li>
        </ul>
      </div>

      <div className="flex items-start gap-2 text-sm text-muted-foreground">
        <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p>
          By joining, you agree to be live on air and consent to our{" "}
          <a href="#" className="text-primary hover:underline">
            privacy policy
          </a>{" "}
          and{" "}
          <a href="#" className="text-primary hover:underline">
            terms of service
          </a>
          .
        </p>
      </div>
    </>
  );
};

export default Guidelines;