import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Camera, LampDesk, List } from "lucide-react";
import { Button } from "@/components/ui/button";

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
              <div className="py-2 grid grid-cols-2 gap-2">
                <Button variant="outline" className="w-full justify-start">
                  <Camera className="h-4 w-4 mr-2" />
                  Shawn
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Camera className="h-4 w-4 mr-2" />
                  Sabrina
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Camera className="h-4 w-4 mr-2" />
                  C-Lane
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Camera className="h-4 w-4 mr-2" />
                  Guest
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Camera className="h-4 w-4 mr-2" />
                  Wide
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Camera className="h-4 w-4 mr-2" />
                  PTZ 2
                </Button>
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
              <div className="py-2 grid grid-cols-2 gap-2">
                <Button variant="outline" className="w-full justify-start">
                  <LampDesk className="h-4 w-4 mr-2" />
                  Studio Main 1
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <LampDesk className="h-4 w-4 mr-2" />
                  Studio Main 2
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <LampDesk className="h-4 w-4 mr-2" />
                  Effects
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <LampDesk className="h-4 w-4 mr-2" />
                  LED Wall 1
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <LampDesk className="h-4 w-4 mr-2" />
                  LED Wall 2
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <LampDesk className="h-4 w-4 mr-2" />
                  Behind Shawn
                </Button>
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
