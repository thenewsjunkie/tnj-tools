import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import VoiceInterface from '@/components/VoiceInterface';
import { Bot, Mic } from 'lucide-react';

const RealtimeAI = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* SEO optimized header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            AI Realtime Voice Chat
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience real-time voice conversations with GPT-4 Realtime API. 
            Natural speech-to-speech interaction with advanced AI.
          </p>
        </header>

        <main className="space-y-8">
          {/* Status indicator */}
          <section className="flex justify-center">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center pb-3">
                <CardTitle className="flex items-center justify-center gap-2 text-lg">
                  <Bot className="w-5 h-5" />
                  AI Status
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex justify-center items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-muted'}`} />
                  <span className="text-sm">
                    {isSpeaking ? 'AI is speaking' : 'AI is listening'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Voice interface */}
          <section>
            <VoiceInterface onSpeakingChange={setIsSpeaking} />
          </section>

          {/* Features section */}
          <section className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Voice Chat Features
                </CardTitle>
                <CardDescription>
                  Advanced real-time AI conversation capabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Real-time Processing</h3>
                    <p className="text-sm text-muted-foreground">
                      Instant speech-to-speech with minimal latency using OpenAI's latest technology
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Natural Conversations</h3>
                    <p className="text-sm text-muted-foreground">
                      Advanced voice activity detection and natural turn-taking
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">High Quality Audio</h3>
                    <p className="text-sm text-muted-foreground">
                      24kHz PCM audio processing for crystal clear communication
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
};

export default RealtimeAI;