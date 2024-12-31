import { Tables } from "@/integrations/supabase/types";
import TimeDisplay from "./TimeDisplay";
import TickerText from "./TickerText";

interface LowerThirdContentProps {
  lowerThird: Tables<"lower_thirds">;
  currentTime: Date;
  isVisible: boolean;
}

export const LowerThirdContent = ({ lowerThird, currentTime, isVisible }: LowerThirdContentProps) => {
  const { primary_text, secondary_text, ticker_text, show_time, type, guest_image_url, logo_url } = lowerThird;

  return (
    <div className={`fixed bottom-0 left-0 w-full transition-opacity duration-400 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex items-end w-full">
        {type === "guest" && guest_image_url ? (
          <div 
            className={`relative bg-black/85 overflow-hidden rounded-l-lg ${isVisible ? 'animate-slide-in-bottom' : ''}`}
            style={{ 
              width: '240px',
              height: '280px',
            }}
          >
            <img 
              src={guest_image_url} 
              alt="Guest"
              className="w-full h-full object-cover"
              style={{
                objectPosition: 'center 20%'
              }}
            />
            <div className="absolute bottom-0 left-0 w-full bg-black/85 text-white py-3 text-xl font-bold uppercase text-center">
              {type}
            </div>
          </div>
        ) : (
          <div className="absolute -top-16 left-0 z-10">
            <div className={`bg-black/85 text-white px-8 py-4 text-xl font-bold uppercase ${isVisible ? 'animate-fade-in' : ''}`}>
              {type}
            </div>
          </div>
        )}

        <div className={`flex-1 relative overflow-hidden ${isVisible ? 'animate-slide-in-bottom' : ''}`} style={{ height: type === "guest" ? '280px' : 'auto' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-[#221F26] to-[#403E43] opacity-95"></div>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-red"></div>
          <div className="relative p-6 pt-8 h-full flex flex-col justify-center">
            <div className="flex justify-between items-start w-full">
              <div className="space-y-2 flex-1 min-w-0">
                {primary_text && (
                  <h1 className={`text-7xl font-bold leading-tight text-white ${isVisible ? 'animate-fade-in' : ''} ${type === 'guest' ? 'border-b-2 border-neon-red inline-block pr-6 -mr-6' : ''}`}>
                    {primary_text}
                  </h1>
                )}
                {secondary_text && (
                  <p className={`text-5xl text-white/90 whitespace-nowrap overflow-hidden text-ellipsis font-light ${isVisible ? 'animate-fade-in' : ''}`} style={{ animationDelay: '200ms' }}>
                    {secondary_text}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4 ml-auto">
                <TimeDisplay currentTime={currentTime} show={show_time} />
                {logo_url && (
                  <img 
                    src={logo_url} 
                    alt="Logo"
                    className={`h-40 w-auto object-contain ${isVisible ? 'animate-fade-in' : ''}`}
                    style={{ animationDelay: '300ms' }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <TickerText text={ticker_text} />
    </div>
  );
};