import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera } from "lucide-react";

const Companion = () => {
  return (
    <Card className="w-full bg-background border border-gray-200 dark:border-white/10">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-foreground" />
            Companion
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Content will be added here later */}
      </CardContent>
    </Card>
  );
};

export default Companion;
