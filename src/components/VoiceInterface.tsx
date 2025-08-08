import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { RealtimeChat, RealtimeMessage } from '@/lib/RealtimeChat';
import { Mic, MicOff, MessageSquare, Volume2 } from 'lucide-react';

interface VoiceInterfaceProps {
  onSpeakingChange: (speaking: boolean) => void;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ onSpeakingChange }) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatRef = useRef<RealtimeChat | null>(null);

  const handleMessage = (message: RealtimeMessage) => {
    console.log('Received message:', message);
    
    if (message.type === 'response.audio_transcript.delta') {
      setCurrentTranscript(prev => prev + (message.delta || ''));
    } else if (message.type === 'response.audio_transcript.done') {
      if (currentTranscript.trim()) {
        setMessages(prev => [...prev, {
          type: 'assistant',
          content: currentTranscript,
          timestamp: Date.now()
        }]);
      }
      setCurrentTranscript('');
    } else if (message.type === 'conversation.item.input_audio_transcription.completed') {
      const transcription = message.content;
      if (transcription) {
        setMessages(prev => [...prev, {
          type: 'user',
          content: transcription,
          timestamp: Date.now()
        }]);
      }
    }
  };

  const handleSpeakingChange = (speaking: boolean) => {
    setIsSpeaking(speaking);
    onSpeakingChange(speaking);
  };

  const startConversation = async () => {
    setIsConnecting(true);
    try {
      chatRef.current = new RealtimeChat(
        handleMessage,
        setIsConnected,
        handleSpeakingChange
      );
      await chatRef.current.connect();
      
      toast({
        title: "Connected",
        description: "Voice interface is ready. Start speaking!",
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : 'Failed to start conversation',
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
    setIsConnected(false);
    setIsSpeaking(false);
    setMessages([]);
    setCurrentTranscript('');
    onSpeakingChange(false);
    
    toast({
      title: "Disconnected",
      description: "Voice conversation ended",
    });
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-3">
            <Volume2 className="w-6 h-6" />
            Voice Chat with AI
          </CardTitle>
          <CardDescription>
            Real-time voice conversation with GPT-4 Realtime
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex justify-center gap-4">
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            {isSpeaking && (
              <Badge variant="outline" className="animate-pulse">
                AI Speaking
              </Badge>
            )}
          </div>
          
          {!isConnected ? (
            <Button 
              onClick={startConversation}
              disabled={isConnecting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Start Voice Chat
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={endConversation}
              variant="destructive"
              size="lg"
            >
              <MicOff className="w-4 h-4 mr-2" />
              End Conversation
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Messages */}
      {(messages.length > 0 || currentTranscript) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Conversation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">
                      {message.type === 'user' ? 'You' : 'AI'}
                    </div>
                    <div>{message.content}</div>
                  </div>
                </div>
              ))}
              
              {currentTranscript && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted text-muted-foreground border-2 border-dashed">
                    <div className="text-sm font-medium mb-1">AI</div>
                    <div className="opacity-70">{currentTranscript}</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VoiceInterface;