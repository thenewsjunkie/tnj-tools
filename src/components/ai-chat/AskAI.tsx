
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AIQueryForm } from "./components/AIQueryForm";
import { AIResponseDisplay } from "./components/AIResponseDisplay";
import { useAIQuery } from "./hooks/useAIQuery";

export const AskAI = () => {
  const {
    question,
    selectedModel,
    aiResponse,
    eli5Mode,
    isLoading,
    handleQuestionChange,
    handleModelChange,
    handleEli5Change,
    handleSubmit
  } = useAIQuery();

  return (
    <div className="bg-black rounded-lg shadow border border-white/10">
      <Card className="bg-transparent border-0 shadow-none">
        <CardHeader className="pb-0 pt-6 px-6">
          <AIQueryForm
            question={question}
            selectedModel={selectedModel}
            eli5Mode={eli5Mode}
            isLoading={isLoading}
            onQuestionChange={handleQuestionChange}
            onModelChange={handleModelChange}
            onEli5Change={handleEli5Change}
            onSubmit={handleSubmit}
          />
        </CardHeader>
        <CardContent className="px-6 py-4">
          {aiResponse && (
            <AIResponseDisplay 
              aiResponse={aiResponse} 
              eli5Mode={eli5Mode}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AskAI;
