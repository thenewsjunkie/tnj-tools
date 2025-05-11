
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Volume2, Play, Loader2 } from "lucide-react";
import { AudioControls } from "@/components/audio/AudioControls";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import { Switch } from "@/components/ui/switch";

type AIModel = "gpt-4o-mini" | "gpt-4o" | "gpt-4.5-preview";

const modelOptions: { value: AIModel; label: string }[] = [
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4.5-preview", label: "GPT-4.5 (Preview)" }
];

export const AskAI = () => {
  const [question, setQuestion] = useState("");
  const [selectedModel, setSelectedModel] = useState<AIModel>("gpt-4o-mini");
  const [aiResponse, setAIResponse] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [eli5Mode, setEli5Mode] = useState(false);
  
  const {
    isPlaying,
    isPaused,
    volume,
    audioPlayer,
    setIsPlaying,
    setIsPaused,
    handlePlaybackEnded,
    handleVolumeChange,
    togglePlayPause
  } = useAudioPlayback();
  
  const handleModelChange = (value: AIModel) => {
    setSelectedModel(value);
  };
  
  const { refetch, isLoading } = useQuery({
    queryKey: ["ai-response", question, selectedModel, eli5Mode],
    queryFn: async () => {
      if (!question.trim()) return null;
      
      try {
        const { data, error } = await supabase.functions.invoke('ask-ai', {
          body: {
            model: selectedModel,
            prompt: question,
            eli5Mode: eli5Mode
          }
        });
        
        if (error) {
          toast({
            title: "Error",
            description: `Failed to get AI response: ${error.message}`,
            variant: "destructive"
          });
          throw new Error(`API Error: ${error.message}`);
        }
        
        const responseText = data.response;
        setAIResponse(responseText);
        return responseText;
      } catch (error) {
        console.error("Error fetching from AI service:", error);
        setAIResponse(`Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
        toast({
          title: "Error",
          description: `Error fetching from AI service: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
          variant: "destructive"
        });
        return null;
      }
    },
    enabled: false
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    try {
      await refetch();
    } catch (error) {
      console.error("Submit error:", error);
    }
  };
  
  const handlePlayAudio = async () => {
    if (!aiResponse) return;
    
    setIsGeneratingAudio(true);
    
    try {
      console.log("Generating audio for text:", aiResponse.slice(0, 50) + "...");
      
      // If the response is too long, trim it to a reasonable length for TTS
      const trimmedText = aiResponse.length > 4000 ? aiResponse.slice(0, 4000) + "..." : aiResponse;
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: trimmedText
        }
      });
      
      if (error) {
        console.error("Error from text-to-speech function:", error);
        throw new Error(`Error generating audio: ${error.message}`);
      }
      
      if (!data || !data.audioData) {
        console.error("Invalid response format from text-to-speech function:", data);
        throw new Error("Failed to generate audio: Invalid response format");
      }
      
      const audioData = data.audioData;
      console.log("Audio data received, length:", audioData.length);
      
      if (audioPlayer.current) {
        try {
          // Convert base64 to blob and create an object URL
          const byteCharacters = atob(audioData);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const audioBlob = new Blob([byteArray], { type: 'audio/mp3' });
          const audioUrl = URL.createObjectURL(audioBlob);
          
          console.log("Created audio URL:", audioUrl);
          
          audioPlayer.current.src = audioUrl;
          audioPlayer.current.volume = volume[0];
          
          // Setup event listener for when audio is ready to play
          const playPromise = audioPlayer.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("Audio playback started successfully");
                setIsPlaying(true);
                setIsPaused(false);
              })
              .catch(err => {
                console.error("Error during audio playback:", err);
                toast({
                  title: "Playback Error",
                  description: "There was a problem playing the audio. Please try again.",
                  variant: "destructive"
                });
                setIsPlaying(false);
                setIsPaused(false);
              });
          }
        } catch (error) {
          console.error("Error processing audio data:", error);
          throw new Error("Failed to process audio data");
        }
      }
    } catch (error) {
      console.error("Error generating audio:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate audio",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingAudio(false);
    }
  };
  
  return (
    <div className="bg-black rounded-lg shadow border border-white/10">
      <Card className="bg-transparent border-0 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">Ask AI</CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">ELI5</span>
              <Switch
                checked={eli5Mode}
                onCheckedChange={setEli5Mode}
                aria-label="Explain Like I'm 5 mode"
              />
              {eli5Mode && (
                <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded-full">
                  Simple mode
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Model:</span>
              <Select
                value={selectedModel}
                onValueChange={(value) => handleModelChange(value as AIModel)}
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
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
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
            
            {aiResponse && (
              <div className="mt-4">
                <div className="p-4 rounded-md bg-black/60 border border-white/10">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Response:</h4>
                      {eli5Mode && (
                        <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded-full">
                          Simple explanation
                        </span>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handlePlayAudio}
                      disabled={isGeneratingAudio || isPlaying || isPaused}
                      className="h-8 w-8 p-0 text-foreground hover:text-primary transition-colors"
                    >
                      {isGeneratingAudio ? 
                        <Loader2 className="h-4 w-4 animate-spin" /> : 
                        <Play className="h-4 w-4" />
                      }
                      <span className="sr-only">Play response</span>
                    </Button>
                  </div>
                  <Textarea 
                    value={aiResponse}
                    readOnly
                    className="min-h-[200px] w-full border-0 bg-transparent focus-visible:ring-0 resize-none"
                  />
                  {(isPlaying || isPaused) && (
                    <div className="mt-2">
                      <AudioControls
                        isPaused={isPaused}
                        isPlaying={isPlaying}
                        volume={volume}
                        onPlayPause={togglePlayPause}
                        onVolumeChange={handleVolumeChange}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
            <audio
              ref={audioPlayer}
              onEnded={handlePlaybackEnded}
              className="hidden"
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AskAI;
