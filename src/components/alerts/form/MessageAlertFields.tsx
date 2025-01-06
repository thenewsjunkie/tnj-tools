import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertEffect } from "@/types/alerts";
import ContentTab from "./tabs/ContentTab";
import StyleTab from "./tabs/StyleTab";
import EffectsTab from "./tabs/EffectsTab";

interface MessageAlertFieldsProps {
  messageText: string;
  setMessageText: (value: string) => void;
  displayDuration: number;
  setDisplayDuration: (value: number) => void;
  textColor: string;
  setTextColor: (value: string) => void;
  backgroundColor: string;
  setBackgroundColor: (value: string) => void;
  textAlignment: 'left' | 'center' | 'right';
  setTextAlignment: (value: 'left' | 'center' | 'right') => void;
  fontFamily: string;
  setFontFamily: (value: string) => void;
  textShadow: boolean;
  setTextShadow: (value: boolean) => void;
  textAnimation: string;
  setTextAnimation: (value: string) => void;
  effects: AlertEffect[];
  setEffects: (effects: AlertEffect[]) => void;
  useGradient: boolean;
  setUseGradient: (value: boolean) => void;
  gradientColor: string;
  setGradientColor: (value: string) => void;
}

const MessageAlertFields = ({
  messageText,
  setMessageText,
  displayDuration,
  setDisplayDuration,
  textColor,
  setTextColor,
  backgroundColor,
  setBackgroundColor,
  textAlignment,
  setTextAlignment,
  fontFamily,
  setFontFamily,
  textShadow,
  setTextShadow,
  textAnimation,
  setTextAnimation,
  effects,
  setEffects,
  useGradient,
  setUseGradient,
  gradientColor,
  setGradientColor,
}: MessageAlertFieldsProps) => {
  return (
    <Tabs defaultValue="content" className="w-full space-y-4">
      <TabsList className="grid w-full grid-cols-3 dark:bg-black/50">
        <TabsTrigger value="content" className="dark:data-[state=active]:bg-white/10">Content</TabsTrigger>
        <TabsTrigger value="style" className="dark:data-[state=active]:bg-white/10">Style</TabsTrigger>
        <TabsTrigger value="effects" className="dark:data-[state=active]:bg-white/10">Effects</TabsTrigger>
      </TabsList>

      <TabsContent value="content">
        <ContentTab
          messageText={messageText}
          setMessageText={setMessageText}
          displayDuration={displayDuration}
          setDisplayDuration={setDisplayDuration}
        />
      </TabsContent>

      <TabsContent value="style">
        <StyleTab
          textColor={textColor}
          setTextColor={setTextColor}
          backgroundColor={backgroundColor}
          setBackgroundColor={setBackgroundColor}
          textAlignment={textAlignment}
          setTextAlignment={setTextAlignment}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
          textShadow={textShadow}
          setTextShadow={setTextShadow}
          textAnimation={textAnimation}
          setTextAnimation={setTextAnimation}
          useGradient={useGradient}
          setUseGradient={setUseGradient}
          gradientColor={gradientColor}
          setGradientColor={setGradientColor}
        />
      </TabsContent>

      <TabsContent value="effects">
        <EffectsTab
          effects={effects}
          setEffects={setEffects}
        />
      </TabsContent>
    </Tabs>
  );
};

export default MessageAlertFields;