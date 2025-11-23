'use client';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { DashboardStats } from '@/lib/services/dashboardAggregationService';

interface ScoreRangeRadarChartProps {
  stats: DashboardStats | null;
}

export default function ScoreRangeRadarChart({ stats }: ScoreRangeRadarChartProps) {
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

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={scoreRangeData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: 'var(--foreground)' }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}/>
          <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
          <Tooltip contentStyle={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--foreground)',
            }}/>
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}