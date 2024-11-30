import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Camera, 
  Mic, 
  MicOff, 
  X, 
  Play,
  CheckCircle,
  AlertCircle,
  Info,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Connect = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [queuePosition, setQueuePosition] = useState(0);
  const [estimatedWait, setEstimatedWait] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Request camera and microphone permissions
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      })
      .catch((err) => {
        toast({
          title: "Camera Access Error",
          description: "Please enable camera and microphone access to join the show.",
          variant: "destructive",
        });
      });

    return () => {
      // Cleanup: stop all tracks when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleMicrophone = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const handleJoinCall = async () => {
    if (!name || !topic) {
      toast({
        title: "Missing Information",
        description: "Please provide your name and topic before joining.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);

    // Create a new call session
    const { data: callSession, error } = await supabase
      .from('call_sessions')
      .insert({
        caller_name: name,
        topic: topic,
        status: 'waiting',
        is_muted: true,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error joining call",
        description: error.message,
        variant: "destructive",
      });
      setIsConnecting(false);
      return;
    }

    // Get current queue position
    const { count } = await supabase
      .from('call_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'waiting')
      .lt('created_at', callSession.created_at);

    setQueuePosition((count || 0) + 1);
    setEstimatedWait((count || 0) * 5); // Estimate 5 minutes per caller
    setIsConnecting(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b">
        <h1 className="text-2xl font-bold digital">Connect to TNJ Show</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="hover:bg-destructive/10"
        >
          <X className="h-6 w-6" />
        </Button>
      </header>

      <div className="container max-w-4xl mx-auto p-4 space-y-8">
        {/* Video Preview */}
        <div className="relative aspect-video bg-black/90 rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
            <Button
              variant="secondary"
              size="icon"
              onClick={toggleMicrophone}
              className="rounded-full bg-black/50 hover:bg-black/70"
            >
              {isMuted ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-black/50 hover:bg-black/70"
            >
              <Camera className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Connection Information */}
        <div className="grid gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="topic">Call Topic</Label>
            <Textarea
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What would you like to discuss?"
              className="resize-none"
            />
          </div>
        </div>

        {/* Guidelines */}
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

        {/* Privacy Notice */}
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

        {/* Connection Status */}
        {queuePosition > 0 ? (
          <div className="bg-primary/10 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <p>
                You're #{queuePosition} in line. Estimated wait: {estimatedWait} minutes
              </p>
            </div>
          </div>
        ) : (
          <Button
            className="w-full py-6 text-lg"
            onClick={handleJoinCall}
            disabled={isConnecting || !name || !topic}
          >
            {isConnecting ? (
              "Connecting..."
            ) : (
              "Join Call"
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Connect;