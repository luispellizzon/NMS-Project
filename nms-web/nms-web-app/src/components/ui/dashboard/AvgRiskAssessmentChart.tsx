// src/components/ui/dashboard/AvgRiskAssessmentChart.tsx
'use client';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { DashboardStats } from '@/lib/services/dashboardAggregationService';

const themeColors = {
  light: { stroke: '#10b981', stop: '#10b981', text: '#10b981' },
  dark: { stroke: '#34d399', stop: '#34d399', text: '#34d399' }
}

interface AvgRiskAssessmentChartProps {
  stats: DashboardStats | null;
}

export default function AvgRiskAssessmentChart({ stats }: AvgRiskAssessmentChartProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-64 w-full animate-pulse bg-muted rounded-lg" />;
  }

  const colors = resolvedTheme === 'dark' ? themeColors.dark : themeColors.light;

  // Calculate risk distribution percentages
  const totalPatients = stats?.totalPatients || 0;
  const highRiskCount = stats?.riskDistribution.high || 0;
  const moderateRiskCount = stats?.riskDistribution.moderate || 0;
  const lowRiskCount = stats?.riskDistribution.low || 0;

  const highRiskPercent = totalPatients > 0 ? Math.round((highRiskCount / totalPatients) * 100) : 0;

  // Create mock trend data for visualization (you can replace this with historical data later)
  const trendData = [
    { month: 'Jan', score: highRiskPercent > 10 ? highRiskPercent - 10 : 0 },
    { month: 'Feb', score: highRiskPercent > 5 ? highRiskPercent - 5 : 0 },
    { month: 'Mar', score: highRiskPercent },
  ];

  return (
    <div className="h-54 overflow-hidden">
      <div className="mb-2">
        <span className="text-4xl font-bold" style={{ color: colors.text }}>
          {highRiskPercent}%
        </span>
        <p className="text-sm text-muted-foreground">High Risk Patients</p>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={trendData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
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