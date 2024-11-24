import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';

const SocialGraph = () => {
  const [data, setData] = useState(() => {
    const today = new Date();
    const initialData = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(today.getMonth() - i);
      initialData.unshift({
        name: date.toLocaleString('default', { month: 'short' }),
        followers: 0,
        date: date.getTime(),
      });
    }
    return initialData;
  });

  useEffect(() => {
    const storedData = localStorage.getItem('followerHistory');
    if (storedData) {
      setData(JSON.parse(storedData));
    }
  }, []);

  useEffect(() => {
    const updateTotalFollowers = () => {
      const elements = document.querySelectorAll('.digital');
      let total = 0;
      
      elements.forEach(el => {
        const followers = el.textContent?.trim() || '';
        const number = parseInt(followers.replace(/[K,M]/g, '')) * (followers.includes('K') ? 1000 : (followers.includes('M') ? 1000000 : 1));
        total += number;
      });

      const today = new Date();
      const newData = [...data];
      const lastEntry = newData[newData.length - 1];
      
      if (lastEntry && new Date(lastEntry.date).toDateString() === today.toDateString()) {
        newData[newData.length - 1] = {
          ...lastEntry,
          followers: total
        };
      } else {
        newData.push({
          name: today.toLocaleString('default', { month: 'short' }),
          followers: total,
          date: today.getTime()
        });
        if (newData.length > 6) {
          newData.shift();
        }
      }
      
      setData(newData);
      localStorage.setItem('followerHistory', JSON.stringify(newData));
    };

    const observer = new MutationObserver(() => {
      updateTotalFollowers();
    });

    const digitalElements = document.querySelectorAll('.digital');
    digitalElements.forEach(element => {
      observer.observe(element, { childList: true, characterData: true, subtree: true });
    });

    return () => observer.disconnect();
  }, [data]);

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