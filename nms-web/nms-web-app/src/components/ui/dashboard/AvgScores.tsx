// src/components/ui/dashboard/AvgScores.tsx
'use client';
import { DashboardStats } from '@/lib/services/dashboardAggregationService';

interface AvgScoresProps {
  stats: DashboardStats | null;
}

export default function AvgScores({ stats }: AvgScoresProps) {
  // Use aggregated data or default values
  const overallScore = stats?.averageScores.overall || 0;
  const cognitiveScore = stats?.averageScores.cognitive || 0;
  const speechScore = stats?.averageScores.speech || 0;
  const memoryScore = stats?.averageScores.memory || 0;

  const subScores = [
    { label: 'Cognitive', value: cognitiveScore.toFixed(1), color: '#3b82f6' },
    { label: 'Speech', value: speechScore.toFixed(1), color: '#10b981' },
    { label: 'Memory', value: memoryScore.toFixed(1), color: '#f59e0b' },
  ];

  return (
    <div className="h-54 flex flex-col justify-between">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="relative">
          <span className="text-6xl font-bold text-secondary-foreground">
            {overallScore.toFixed(1)}
          </span>
          <span className="absolute top-1 -right-6 text-lg font-medium text-muted-foreground">
            %
          </span>
        </div>
        <p className="text-muted-foreground mt-1">Overall Average</p>
      </div>

      <div className="flex justify-around items-center pt-4 border-t">
        {subScores.map((score) => (
          <div key={score.label} className="text-center">
            <div className="flex items-center gap-2 justify-center">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: score.color }}></span>
              <p className="font-semibold text-foreground">{score.value}%</p>
            </div>
            <p className="text-xs text-muted-foreground">{score.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}