import { useEffect } from "react";
import CountdownBanner from "@/components/ss-tools/CountdownBanner";

const SSToolsEmbed = () => {
  useEffect(() => {
    // Remove any margin/padding on html/body for clean embed
    document.documentElement.style.margin = "0";
    document.documentElement.style.padding = "0";
    document.documentElement.style.overflow = "hidden";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";
  }, []);

  return (
    <div style={{ background: "transparent", width: "100%", overflow: "hidden" }}>
      <CountdownBanner embed />
    </div>
  );
};

export default SSToolsEmbed;
