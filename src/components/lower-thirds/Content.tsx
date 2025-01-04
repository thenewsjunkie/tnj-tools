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

  return (
    <div className="relative p-6 pt-8 h-full flex flex-col justify-center">
      <div className="absolute inset-0 bg-gradient-to-r from-[#221F26] to-[#403E43] opacity-95"></div>
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-red"></div>
      <div className="relative flex justify-between items-start w-full">
        <div className="space-y-2 flex-1 min-w-0">
          {primary_text && (
            <h1 className={`text-7xl font-bold leading-tight text-white ${isVisible ? 'animate-fade-in' : ''} ${type === 'guest' ? 'border-b-2 border-neon-red inline-block pr-6 -mr-6' : ''}`}>
              {primary_text}
            </h1>
          )}
          {secondary_text && (
            <p className={`text-5xl text-white/90 whitespace-nowrap overflow-hidden text-ellipsis font-light ${isVisible ? 'animate-fade-in' : ''}`}>
              {secondary_text}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4 ml-auto">
          <TimeDisplay currentTime={currentTime} show={show_time} />
          {logo_url && <Logo url={logo_url} isVisible={isVisible} />}
        </div>
      </div>
    </div>
  );
};

export default Content;