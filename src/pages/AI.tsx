import Alerts from "@/components/Alerts";
import AIForm from "@/components/ai/AIForm";
import ImplementationCard from "@/components/ai/ImplementationCard";
import VersionHistory from "@/components/ai/VersionHistory";

const AI = () => {
  return (
    <div className="space-y-8">
      <AIForm />
      <ImplementationCard />
      <VersionHistory />
      <Alerts />
    </div>
  );
};

export default AI;