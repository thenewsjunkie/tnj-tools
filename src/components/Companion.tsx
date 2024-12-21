import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Camera, LampDesk, List } from "lucide-react";

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
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="cameras">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                <span>Cameras</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="py-2 space-y-2">
                {/* Camera buttons will go here */}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="lights">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <LampDesk className="h-4 w-4" />
                <span>Lights</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="py-2 space-y-2">
                {/* Light controls will go here */}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="others">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <List className="h-4 w-4" />
                <span>Others</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="py-2 space-y-2">
                {/* Other controls will go here */}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default Companion;
