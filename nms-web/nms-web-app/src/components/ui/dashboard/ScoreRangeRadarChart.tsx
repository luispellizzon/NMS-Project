'use client';
import { useEffect, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { DashboardStats } from '@/lib/services/dashboardAggregationService';
import { useTheme } from 'next-themes';

interface ScoreRangeRadarChartProps {
  stats: DashboardStats | null;
}

// Custom tooltip component with theme-aware colors
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-2 shadow-lg">
        <p className="text-sm font-medium text-foreground">{payload[0].payload.subject}</p>
        <p className="text-sm text-primary">
          Score: {payload[0].value.toFixed(1)}
        </p>
      </div>
    );
  }
  return null;
};

export default function ScoreRangeRadarChart({ stats }: ScoreRangeRadarChartProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use aggregated data or default values
  const cognitiveScore = stats?.averageScores.cognitive || 0;
  const speechScore = stats?.averageScores.speech || 0;
  const memoryScore = stats?.averageScores.memory || 0;
  const overallScore = stats?.averageScores.overall || 0;

  const scoreRangeData = [
    { subject: 'Cognitive', score: cognitiveScore },
    { subject: 'Speech', score: speechScore },
    { subject: 'Memory', score: memoryScore },
    { subject: 'Overall', score: overallScore },
  ];

  // Determine if we're in dark mode
  const isDark = mounted && (resolvedTheme === 'dark' || theme === 'dark');

  // Theme-aware colors - more vibrant and pronounced
  const colors = {
    grid: isDark ? '#4b5563' : '#d1d5db', // Darker grid in dark mode, lighter in light mode
    text: isDark ? '#f9fafb' : '#111827', // Brighter text in dark mode, darker in light mode
    mutedText: isDark ? '#d1d5db' : '#4b5563', // Lighter muted text
    primary: isDark ? '#60a5fa' : '#1d4ed8', // Brighter blue in dark mode, deeper blue in light mode
  };

  if (!mounted) {
    // Return a placeholder during SSR to avoid hydration mismatch
    return <div className="h-64" />;
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={scoreRangeData}>
          <PolarGrid stroke={colors.grid} />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fontSize: 12, fill: colors.text }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: colors.mutedText }}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke={colors.primary}
            fill={colors.primary}
            fillOpacity={0.6}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}