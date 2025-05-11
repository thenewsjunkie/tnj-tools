
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Play } from "lucide-react";
import { AudioControls } from "@/components/audio/AudioControls";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface AIResponseDisplayProps {
  aiResponse: string | null;
  eli5Mode: boolean;
  conversationId: string | null;
  onDisplayInOBS: () => Promise<boolean>;
}

export const AIResponseDisplay = ({ 
  aiResponse, 
  eli5Mode, 
  conversationId,
  onDisplayInOBS 
}: AIResponseDisplayProps) => {
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [displayedInOBS, setDisplayedInOBS] = useState(false);
  
  const {
    isPlaying,
    isPaused,
    volume,
    audioPlayer,
    setIsPlaying,
    setIsPaused,
    handlePlaybackEnded,
    handleVolumeChange,
    togglePlayPause,
    resetPlayer
  } = useAudioPlayback();
  
  // Reset player and OBS display state when aiResponse changes
  useEffect(() => {
    resetPlayer();
    setDisplayedInOBS(false);
  }, [aiResponse]);
  
  const handlePlayAudio = async () => {
    if (!aiResponse) return;
    
    setIsGeneratingAudio(true);
    
    try {
      console.log("Generating audio for text:", aiResponse.slice(0, 50) + "...");
      
      // First, display the conversation in OBS
      if (!displayedInOBS && conversationId) {
        const success = await onDisplayInOBS();
        if (success) {
          setDisplayedInOBS(true);
        }
      }
      
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

  if (!aiResponse) return null;

  return (
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
            {displayedInOBS && (
              <span className="text-[10px] bg-neon-red/20 text-neon-red px-1.5 py-0.5 rounded-full">
                Showing in OBS
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
      <audio
        ref={audioPlayer}
        onEnded={handlePlaybackEnded}
        className="hidden"
      />
    </div>
  );
};
