import React from 'react';
import { LineChart as Chart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Scatter } from 'recharts';
import { Bolt } from 'lucide-react';

interface BatteryHistory {
  timestamp: number;
  level: number;
  isCharging: boolean;
}

interface BatteryGraphProps {
  data: BatteryHistory[];
}

export const BatteryGraph: React.FC<BatteryGraphProps> = ({ data }) => {
  const formattedData = data.map(entry => ({
    ...entry,
    time: new Date(entry.timestamp).toLocaleTimeString(),
  }));

  return (
    <div className="w-full h-64 relative">
      <ResponsiveContainer width="100%" height="100%">
        <Chart data={formattedData}>
          <XAxis dataKey="time" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} label={{ value: 'Battery Level (%)', angle: -90, position: 'insideLeft' }} />
          <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '5px', padding: '5px' }} />
          <Line type="monotone" dataKey="level" stroke="#4CAF50" strokeWidth={2} dot={false} />
          
          {/* Charging indicators */}
          <Scatter data={formattedData.filter(d => d.isCharging)} fill="yellow">
            {formattedData.filter(d => d.isCharging).map((entry, index) => (
              <Bolt key={index} x={entry.time} y={entry.level} className="text-yellow-500 absolute" />
            ))}
          </Scatter>
        </Chart>
      </ResponsiveContainer>
    </div>
  );
};