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

  // Get gradient colors based on type
  const getGradient = () => {
    switch (type) {
      case "news":
        return "from-[#1A1F2C] to-[#6E59A5]";
      case "guest":
        return "from-[#1A1F2C] to-[#4A3B8C]";
      case "topic":
        return "from-[#1A1F2C] to-[#5D478F]";
      case "breaking":
        return "from-[#1A1F2C] to-[#8E4A8B]";
      default:
        return "from-[#1A1F2C] to-[#6E59A5]";
    }
  };

  // Get accent color based on type
  const getAccentColor = () => {
    switch (type) {
      case "news":
        return "bg-[#9b87f5]";
      case "guest":
        return "bg-[#8A7BE6]";
      case "topic":
        return "bg-[#A587F5]";
      case "breaking":
        return "bg-[#F587E6]";
      default:
        return "bg-[#9b87f5]";
    }
  };
  
  return (
    <div className="relative p-6 pt-8 h-full flex flex-col justify-center">
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r ${getGradient()} rounded-lg opacity-95`}></div>

      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${getAccentColor()} rounded-l-lg`}></div>

      {type !== "guest" && (
        <div className="absolute -top-16 left-0 z-10">
          <div className={`bg-gradient-to-r ${getGradient()} text-white px-8 py-4 text-xl font-bold uppercase rounded-t-lg`}>
            {type}
          </div>
        </div>
      )}

      <div className="relative flex justify-between items-start w-full">
        <div className="flex items-center gap-8 flex-1 min-w-0">
          {/* Logo section */}
          {logo_url && (
            <div className="flex-shrink-0">
              <Logo url={logo_url} isVisible={isVisible} />
            </div>
          )}

          {/* Content section */}
          <div className="space-y-2">
            {primary_text && (
              <h1 className={`text-7xl font-bold leading-tight transition-opacity duration-300 
                ${isVisible ? 'opacity-100' : 'opacity-0'}
                text-[#FFD700]
                ${type === 'guest' ? 'border-b-2 border-[#9b87f5] inline-block pr-6 -mr-6' : ''}`}>
                {primary_text}
              </h1>
            )}
            {secondary_text && (
              <p className={`text-5xl whitespace-nowrap overflow-hidden text-ellipsis font-light 
                transition-opacity duration-300 
                ${isVisible ? 'opacity-100' : 'opacity-0'}
                text-white`}>
                {secondary_text}
              </p>
            )}
          </div>
        </div>

        {/* Time display section */}
        <div className="flex items-center gap-4 ml-auto">
          <TimeDisplay currentTime={currentTime} show={show_time} />
        </div>
      </div>
    </div>
  );
};

export default Content;