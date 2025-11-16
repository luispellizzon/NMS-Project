// src/components/ui/dashboard/OverallAppointmentsChart.tsx
'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { appointmentsChartData } from '@/lib/mock_data';
import { useTheme } from 'next-themes';

const legendLabels = {
  assessment: 'Assessment',
  screening: 'Screening',
  consultation: 'Consultation',
  followUp: 'Follow-up',
};

const themeColors = {
  light: {
    assessment: '#6b7280',
    screening: '#3b82f6',
    consultation: '#f59e0b',
    followUp: '#ef4444',
    tick: '#6b7280',
    grid: '#e5e7eb'
  },
  dark: {
    assessment: '#4b5563',
    screening: '#1e40af',
    consultation: '#b45309',
    followUp: '#991b1b',
    tick: '#9ca3af',
    grid: '#374151'
  }
};

export default function OverallAppointmentsChart() {
  const { resolvedTheme } = useTheme();
  const colors = resolvedTheme === 'dark' ? themeColors.dark : themeColors.light;

  return (
    <div className="h-full min-h-[270px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={appointmentsChartData}
          margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: colors.tick }} />
          <YAxis tick={{ fontSize: 12, fill: colors.tick }} />
          <Tooltip
            cursor={{
              fill: resolvedTheme === 'dark' ? 'rgba(30, 41, 59, 0.3)' : 'rgba(226, 232, 240, 0.5)',
              opacity: 0.5
            }}
            contentStyle={{
              backgroundColor: 'var(--color-popover)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-popover-foreground)',
              borderRadius: '0.5rem',
              border: '1px solid',
            }}
          />
          <Legend
            iconSize={10}
            formatter={(value) => legendLabels[value as keyof typeof legendLabels]}
          />
          <Bar dataKey="assessment" stackId="a" fill={colors.assessment} name={legendLabels.assessment} />
          <Bar dataKey="screening" stackId="a" fill={colors.screening} name={legendLabels.screening} />
          <Bar dataKey="consultation" stackId="a" fill={colors.consultation} name={legendLabels.consultation} />
          <Bar dataKey="followUp" stackId="a" fill={colors.followUp} name={legendLabels.followUp} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}