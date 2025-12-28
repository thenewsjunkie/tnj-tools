import { AIQueryForm } from "./components/AIQueryForm";
import { AIResponseDisplay } from "./components/AIResponseDisplay";
import { useAIQuery } from "./hooks/useAIQuery";

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
    <div className="space-y-3">
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
      {aiResponse && (
        <AIResponseDisplay 
          aiResponse={aiResponse} 
          eli5Mode={eli5Mode}
          detailedMode={detailedMode}
          conversationId={conversationId}
          onDisplayInOBS={displayInOBS}
        />
      )}
    </div>
  );
};

export default AskAI;
