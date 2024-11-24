import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { Link } from "react-router-dom";

const InterviewRequestsModule = () => {
  return (
    <Card className="bg-black/50 border-white/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white text-lg sm:text-xl">Interview Requests</CardTitle>
        <Link to="/interview-requests">
          <Button variant="ghost" size="icon" className="text-white hover:text-primary hover:bg-white/10">
            <Mail className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="p-3 bg-white/5 rounded-lg">
            <p className="text-white text-sm">No pending requests</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InterviewRequestsModule;