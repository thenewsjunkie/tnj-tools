import { useState, useEffect } from "react";
import { useLowerThird } from "@/components/lower-thirds/hooks/useLowerThird";
import { LowerThirdContent } from "@/components/lower-thirds/LowerThirdContent";

const LowerThird = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { lowerThird, isLoading, isVisible, logoLoaded } = useLowerThird();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!lowerThird || isLoading || !logoLoaded) return null;

  return (
    <LowerThirdContent
      lowerThird={lowerThird}
      currentTime={currentTime}
      isVisible={isVisible}
    />
  );
};

export default LowerThird;