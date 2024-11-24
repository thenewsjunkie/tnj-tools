import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Send } from "lucide-react";

const InterviewRequests = () => {
  const [email, setEmail] = useState("");
  const [emailScript, setEmailScript] = useState(
    "Hi,\n\nI'd love to have you on the show to discuss your work. Would you be interested in scheduling an interview?\n\nBest regards,\nYour Name"
  );
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This is where email sending logic would go
    toast({
      title: "Feature not implemented",
      description: "Email functionality requires backend integration.",
    });
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
              <Button type="submit" className="w-full" disabled>
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
            <div className="text-white/60 text-center py-8">
              No conversations yet
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InterviewRequests;