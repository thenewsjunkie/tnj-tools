import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', followers: 280000 },
  { name: 'Feb', followers: 300000 },
  { name: 'Mar', followers: 320000 },
  { name: 'Apr', followers: 340000 },
  { name: 'May', followers: 360000 },
  { name: 'Jun', followers: 380000 },
];

const SocialGraph = () => {
  return (
    <Card className="bg-black/50 border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-lg sm:text-xl">Total Followers Growth</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] sm:h-[350px] md:h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="name" 
                stroke="#fff"
                tick={{ fill: '#fff' }}
                fontSize={12}
              />
              <YAxis 
                stroke="#fff"
                tick={{ fill: '#fff' }}
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#000',
                  border: '1px solid #333',
                  color: '#fff'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="followers" 
                stroke="#ff1717"
                strokeWidth={2}
                dot={{ fill: '#ff1717' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialGraph;