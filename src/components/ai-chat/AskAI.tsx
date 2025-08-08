import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AIQueryForm } from "./components/AIQueryForm";
import { AIResponseDisplay } from "./components/AIResponseDisplay";
import { useAIQuery } from "./hooks/useAIQuery";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
export const AskAI = () => {
  const {
    question,
    selectedModel,
    aiResponse,
    eli5Mode,
    detailedMode,
    isLoading,
    conversationId,
    handleQuestionChange,
    handleModelChange,
    handleEli5Change,
    handleDetailedChange,
    handleSubmit,
    displayInOBS
  } = useAIQuery();

  return (
    <div className="bg-black rounded-lg shadow border border-white/10">
      <Card className="bg-transparent border-0 shadow-none">
        <CardHeader className="pb-0 pt-6 px-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">TNJ AI</h3>
            <Link to="/realtime-ai">
              <Button size="sm" variant="outline">Realtime Voice</Button>
            </Link>
          </div>
          <AIQueryForm
            question={question}
            selectedModel={selectedModel}
            eli5Mode={eli5Mode}
            detailedMode={detailedMode}
            isLoading={isLoading}
            onQuestionChange={handleQuestionChange}
            onModelChange={handleModelChange}
            onEli5Change={handleEli5Change}
            onDetailedChange={handleDetailedChange}
            onSubmit={handleSubmit}
          />
        </CardHeader>
        <CardContent className="px-6 py-4">
          {aiResponse && (
            <AIResponseDisplay 
              aiResponse={aiResponse} 
              eli5Mode={eli5Mode}
              detailedMode={detailedMode}
              conversationId={conversationId}
              onDisplayInOBS={displayInOBS}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AskAI;
