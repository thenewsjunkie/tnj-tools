import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Send, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { InterviewRequest } from "@/types/interview";

const InterviewRequests = () => {
  const [email, setEmail] = useState("");
  const [emailScript, setEmailScript] = useState(
    "Hi,\n\nI'd love to have you on the show to discuss your work. Would you be interested in scheduling an interview?\n\nBest regards,\nYour Name"
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['interview-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interview_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as InterviewRequest[];
    },
  });

  const sendRequestMutation = useMutation({
    mutationFn: async ({ email, script }: { email: string; script: string }) => {
      const { data, error } = await supabase
        .from('interview_requests')
        .insert([
          {
            guest_email: email,
            email_script: script,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Send email using Supabase Edge Function
      const { error: emailError } = await supabase.functions.invoke('send-interview-request', {
        body: { email, script },
      });

      if (emailError) throw emailError;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview-requests'] });
      setEmail("");
      setEmailScript("");
      toast({
        title: "Request sent",
        description: "Your interview request has been sent successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !emailScript.trim()) {
      toast({
        title: "Error",
        description: "Please enter both email and message",
        variant: "destructive",
      });
      return;
    }
    sendRequestMutation.mutate({ email, script: emailScript });
  };

  return (
    <div className="min-h-screen bg-black p-4 sm:p-6 md:p-8">
      <nav className="flex justify-between items-center mb-8">
        <Link 
          to="/admin" 
          className="text-white hover:text-neon-red transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admin
        </Link>
        <h1 className="text-white text-xl sm:text-2xl digital">Interview Requests</h1>
      </nav>

      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-black/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">New Interview Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Enter guest's email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Textarea
                  placeholder="Customize your email script"
                  value={emailScript}
                  onChange={(e) => setEmailScript(e.target.value)}
                  className="min-h-[200px] bg-white/5 border-white/10 text-white"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={sendRequestMutation.isPending}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Request
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-black/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Recent Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-white/60 text-center py-8">
                Loading...
              </div>
            ) : !requests?.length ? (
              <div className="text-white/60 text-center py-8">
                No conversations yet
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 bg-white/5 rounded-lg space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white">{request.guest_email}</p>
                        <p className="text-sm text-gray-400">
                          {new Date(request.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4" />
                        <span className="capitalize">{request.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InterviewRequests;