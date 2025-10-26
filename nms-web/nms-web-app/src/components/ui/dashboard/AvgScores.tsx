// src/components/ui/dashboard/AvgScores.tsx
'use client';
import { avgScoresData } from '@/lib/mock_data';

export default function AvgScores() {
  return (
    <div className="h-54 flex flex-col justify-between">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="relative">
          <span className="text-6xl font-bold text-secondary-foreground">{avgScoresData.mainScore}</span>
          <span className="absolute top-1 -right-6 text-lg font-medium text-muted-foreground">{avgScoresData.mainUnit}</span>
        </div>
        <p className="text-muted-foreground mt-1">{avgScoresData.mainLabel}</p>
      </div>

      <div className="flex justify-around items-center pt-4 border-t">
        {avgScoresData.subScores.map((score) => (
          <div key={score.label} className="text-center">
            <div className="flex items-center gap-2 justify-center">
               <span className="h-2 w-2 rounded-full" style={{ backgroundColor: score.color }}></span>
               <p className="font-semibold text-foreground">{score.value}</p>
            </div>
            <p className="text-xs text-muted-foreground">{score.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};