import { Tables } from "@/integrations/supabase/types";

interface GuestSectionProps {
  guestImageUrl: string;
  type: string;
  isVisible: boolean;
}

const GuestSection = ({ guestImageUrl, type, isVisible }: GuestSectionProps) => {
  return (
    <div 
      className={`relative bg-black/85 overflow-hidden rounded-l-lg ${isVisible ? 'animate-slide-in-bottom' : ''}`}
      style={{ 
        width: '240px',
        height: '280px',
      }}
    >
      <img 
        src={guestImageUrl} 
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
  );
};

export default GuestSection;