interface TrendsProps {
  trends: string[];
}

const Trends = ({ trends }: TrendsProps) => {
  if (trends.length === 0) return null;
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold border-b pb-2">Trending on Google</h3>
      <div className="space-y-2 text-left">
        {trends.map((trend, index) => (
          <p key={index} className="leading-relaxed">
            {trend}
          </p>
        ))}
      </div>
    </div>
  );
};

export default Trends;