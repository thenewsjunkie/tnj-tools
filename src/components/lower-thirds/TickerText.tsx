interface TickerTextProps {
  text: string;
}

const TickerText = ({ text }: TickerTextProps) => {
  if (!text) return null;

  return (
    <div className="mt-2 bg-black/90 text-white p-2 w-full overflow-hidden whitespace-nowrap">
      <div 
        className="inline-block whitespace-nowrap animate-[marquee_60s_linear_infinite]"
        style={{
          animation: 'marquee 60s linear infinite',
          paddingRight: '100px'
        }}
      >
        {text}
      </div>
      <div 
        className="inline-block whitespace-nowrap animate-[marquee_60s_linear_infinite]"
        style={{
          animation: 'marquee 60s linear infinite',
          paddingRight: '100px'
        }}
      >
        {text}
      </div>
    </div>
  );
};

export default TickerText;