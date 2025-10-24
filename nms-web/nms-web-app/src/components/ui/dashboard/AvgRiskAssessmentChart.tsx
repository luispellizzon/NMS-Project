'use client';

import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { avgRiskAssessmentData } from '@/lib/mock_data';

export default function AvgRiskAssessmentChart() {
    const latestScore = avgRiskAssessmentData[avgRiskAssessmentData.length - 1].score;
  return (
    // The fix: Add `overflow-hidden` to the root container
    <div className="h-64 overflow-hidden">
        <div className="mb-2">
            <span className="text-4xl font-bold text-green-500">{latestScore}%↑</span>
            <p className="text-sm text-gray-500">Increase from last month</p>
        </div>
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart
          data={avgRiskAssessmentData}
          margin={{
            top: 5, right: 10, left: 10, bottom: 5, // Added some margin to prevent clipping
          }}
        >
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Tooltip 
            cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '3 3' }}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid #ccc',
              borderRadius: '0.5rem',
            }}
          />
          <Area type="monotone" dataKey="score" stroke="#10b981" fillOpacity={1} fill="url(#colorScore)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}