interface TickerTextProps {
  text: string;
}

const TickerText = ({ text }: TickerTextProps) => {
  if (!text) return null;

  return (
    <div className="mt-2 bg-black/90 text-white p-2 w-full overflow-hidden whitespace-nowrap">
      <div className="relative inline-flex whitespace-nowrap">
        <div 
          className="animate-[marquee_60s_linear_infinite]"
          style={{
            paddingRight: '50px'
          }}
        >
          {text}
        </div>
        <div 
          className="absolute top-0 animate-[marquee_60s_linear_infinite]"
          style={{
            left: '100%',
            animation: 'marquee 60s linear infinite',
            animationDelay: '-30s',
            paddingRight: '50px'
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};

export default TickerText;