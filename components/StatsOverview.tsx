
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const data = [
  { name: 'Mon', completion: 40 },
  { name: 'Tue', completion: 60 },
  { name: 'Wed', completion: 45 },
  { name: 'Thu', completion: 90 },
  { name: 'Fri', completion: 65 },
  { name: 'Sat', completion: 85 },
  { name: 'Sun', completion: 100 },
];

export const StatsOverview: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Consistency Score</h2>
          <p className="text-sm text-slate-500">Weekly exercise completion rate</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-emerald-600">82%</span>
          <p className="text-[10px] font-bold text-emerald-500 uppercase">+12% vs last week</p>
        </div>
      </div>
      
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#94a3b8', fontSize: 12}}
              dy={10}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Area 
              type="monotone" 
              dataKey="completion" 
              stroke="#10b981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorComp)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
