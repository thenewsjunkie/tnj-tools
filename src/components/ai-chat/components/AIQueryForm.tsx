
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

type AIModel = "gpt-4o-mini" | "gpt-4o" | "gpt-4.5-preview";

const modelOptions: { value: AIModel; label: string }[] = [
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4.5-preview", label: "GPT-4.5 (Preview)" }
];

interface AIQueryFormProps {
  question: string;
  selectedModel: AIModel;
  eli5Mode: boolean;
  detailedMode: boolean;
  isLoading: boolean;
  onQuestionChange: (value: string) => void;
  onModelChange: (value: AIModel) => void;
  onEli5Change: (value: boolean) => void;
  onDetailedChange: (value: boolean) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export const AIQueryForm = ({
  question,
  selectedModel,
  eli5Mode,
  detailedMode,
  isLoading,
  onQuestionChange,
  onModelChange,
  onEli5Change,
  onDetailedChange,
  onSubmit
}: AIQueryFormProps) => {
  return (
    <>
      <div className="flex flex-row items-center justify-between pb-2">
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">ELI5</span>
            <Switch
              checked={eli5Mode}
              onCheckedChange={(checked) => {
                onEli5Change(checked);
                if (checked && detailedMode) {
                  onDetailedChange(false);
                }
              }}
              aria-label="Explain Like I'm 5 mode"
            />
            {eli5Mode && (
              <Badge variant="outline" className="text-[10px] bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                Simple mode
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Detailed</span>
            <Switch
              checked={detailedMode}
              onCheckedChange={(checked) => {
                onDetailedChange(checked);
                if (checked && eli5Mode) {
                  onEli5Change(false);
                }
              }}
              aria-label="Detailed mode"
            />
            {detailedMode && (
              <Badge variant="outline" className="text-[10px] bg-blue-500/20 text-blue-500 border-blue-500/30">
                In-depth
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Model:</span>
            <Select
              value={selectedModel}
              onValueChange={(value) => onModelChange(value as AIModel)}
            >
              <SelectTrigger className="w-[180px] h-8 text-xs bg-black/50">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {modelOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={question}
            onChange={(e) => onQuestionChange(e.target.value)}
            placeholder="Ask AI a question..."
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={isLoading || !question.trim()} 
            className="shrink-0"
          >
            {isLoading ? "Thinking..." : "Ask AI"}
          </Button>
        </div>
      </form>
    </>
  );
};
