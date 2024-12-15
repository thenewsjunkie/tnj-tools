import Alerts from "@/components/Alerts";
import AIForm from "@/components/ai/AIForm";
import ImplementationCard from "@/components/ai/ImplementationCard";
import VersionHistory from "@/components/ai/VersionHistory";

const AI = () => {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-start gap-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-4 tnj-ai-title">TNJ AI</h1>
          <AIForm />
          <div className="mt-6">
            <ImplementationCard />
          </div>
        </div>
        
        <div className="w-[400px]">
          <Alerts />
        </div>
      </div>

      <VersionHistory />
    </div>
  );
};

export default AI;