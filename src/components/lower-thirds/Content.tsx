import { Tables } from "@/integrations/supabase/types";
import TimeDisplay from "./TimeDisplay";
import Logo from "./Logo";

interface ContentProps {
  lowerThird: Tables<"lower_thirds">;
  currentTime: Date;
  isVisible: boolean;
}

const Content = ({ lowerThird, currentTime, isVisible }: ContentProps) => {
  const { primary_text, secondary_text, show_time, logo_url, type } = lowerThird;

  // Different styling for news type
  const isNews = type === "news";
  
  return (
    <div className="relative p-6 pt-8 h-full flex flex-col justify-center">
      {/* Background gradient - different for news type */}
      <div className={`absolute inset-0 ${
        isNews 
          ? "bg-gradient-to-r from-[#1A1F2C] to-[#6E59A5] rounded-lg"
          : "bg-gradient-to-r from-[#221F26] to-[#403E43]"
      } opacity-95`}></div>

      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
        isNews ? "bg-[#9b87f5]" : "bg-neon-red"
      } ${isNews ? "rounded-l-lg" : ""}`}></div>

      <div className="relative flex justify-between items-start w-full">
        <div className={`flex ${isNews ? "items-center gap-8" : ""} flex-1 min-w-0`}>
          {/* Logo section for news type */}
          {isNews && logo_url && (
            <div className="flex-shrink-0">
              <Logo url={logo_url} isVisible={isVisible} />
            </div>
          )}

          {/* Content section */}
          <div className="space-y-2">
            {primary_text && (
              <h1 className={`text-7xl font-bold leading-tight transition-opacity duration-300 
                ${isVisible ? 'opacity-100' : 'opacity-0'}
                ${isNews ? 'text-[#FFD700]' : 'text-white'}
                ${type === 'guest' ? 'border-b-2 border-neon-red inline-block pr-6 -mr-6' : ''}`}>
                {primary_text}
              </h1>
            )}
            {secondary_text && (
              <p className={`text-5xl whitespace-nowrap overflow-hidden text-ellipsis font-light 
                transition-opacity duration-300 
                ${isVisible ? 'opacity-100' : 'opacity-0'}
                ${isNews ? 'text-white' : 'text-white/90'}`}>
                {secondary_text}
              </p>
            )}
          </div>
        </div>

        {/* Time display and non-news logo section */}
        <div className="flex items-center gap-4 ml-auto">
          <TimeDisplay currentTime={currentTime} show={show_time} />
          {!isNews && logo_url && <Logo url={logo_url} isVisible={isVisible} />}
        </div>
      </div>
    </div>
  );
};

export default Content;