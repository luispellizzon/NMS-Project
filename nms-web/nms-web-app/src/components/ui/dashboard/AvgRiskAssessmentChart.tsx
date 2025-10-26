// src/components/ui/dashboard/AvgRiskAssessmentChart.tsx
'use client';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { avgRiskAssessmentData } from '@/lib/mock_data';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const themeColors = {
  light: { stroke: '#10b981', stop: '#10b981', text: '#10b981' },
  dark: { stroke: '#34d399', stop: '#34d399', text: '#34d399' }
}

export default function AvgRiskAssessmentChart() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false); // State to track if component has mounted

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a skeleton or null on the server and initial client render
    return <div className="h-64 w-full animate-pulse bg-muted rounded-lg" />;
  }
  
  const colors = resolvedTheme === 'dark' ? themeColors.dark : themeColors.light;
  const latestScore = avgRiskAssessmentData[avgRiskAssessmentData.length - 1].score;

  return (
    <div className="h-54 overflow-hidden">
      <div className="mb-2">
        <span className="text-4xl font-bold" style={{ color: colors.text }}>
          {latestScore}%↑
        </span>
        <p className="text-sm text-muted-foreground">Increase from last month</p>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={avgRiskAssessmentData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.stop} stopOpacity={0.8} />
              <stop offset="95%" stopColor={colors.stop} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            cursor={{ fill: 'var(--accent)' }}
            contentStyle={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              color: 'var(--card-foreground)',
              borderRadius: 'var(--radius)',
            }}
          />
          <Area type="monotone" dataKey="score" stroke={colors.stroke} strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}