import { Tables } from "@/integrations/supabase/types";
import TimeDisplay from "../TimeDisplay";

interface ContentSectionProps {
  primaryText: string;
  secondaryText?: string;
  showTime: boolean;
  currentTime: Date;
  logoUrl?: string;
  type: string;
  isVisible: boolean;
  logoLoaded: boolean;
}

const ContentSection = ({ 
  primaryText, 
  secondaryText, 
  showTime, 
  currentTime, 
  logoUrl, 
  type,
  isVisible,
  logoLoaded
}: ContentSectionProps) => {
  return (
    <div className={`flex-1 relative overflow-hidden ${isVisible ? 'animate-slide-in-bottom' : ''}`} style={{ height: type === "guest" ? '280px' : 'auto' }}>
      <div className="absolute inset-0 bg-gradient-to-r from-[#221F26] to-[#403E43] opacity-95"></div>
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-red"></div>
      <div className="relative p-6 pt-8 h-full flex flex-col justify-center">
        <div className="flex justify-between items-start w-full">
          <div className="space-y-2 flex-1 min-w-0">
            {primaryText && (
              <h1 className={`text-7xl font-bold leading-tight text-white ${isVisible ? 'animate-fade-in' : ''} ${type === 'guest' ? 'border-b-2 border-neon-red inline-block pr-6 -mr-6' : ''}`}>
                {primaryText}
              </h1>
            )}
            {secondaryText && (
              <p className={`text-5xl text-white/90 whitespace-nowrap overflow-hidden text-ellipsis font-light ${isVisible ? 'animate-fade-in' : ''}`} style={{ animationDelay: '200ms' }}>
                {secondaryText}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <TimeDisplay currentTime={currentTime} show={showTime} />
            {logoUrl && logoLoaded && (
              <img 
                src={logoUrl} 
                alt="Logo"
                className={`h-40 w-auto object-contain ${isVisible ? 'animate-fade-in' : ''}`}
                style={{ animationDelay: '300ms' }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentSection;