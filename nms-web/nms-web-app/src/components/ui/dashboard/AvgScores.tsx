'use client';
import { avgScoresData } from '@/lib/mock_data';

export default function AvgScores() {
  return (
    <div className="h-64 flex flex-col justify-between">
      {/* Main Score Display */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="relative">
          <span className="text-6xl font-bold text-brand-secondary">{avgScoresData.mainScore}</span>
          <span className="absolute top-1 -right-6 text-lg font-medium text-gray-500">{avgScoresData.mainUnit}</span>
        </div>
        <p className="text-gray-500 mt-1">{avgScoresData.mainLabel}</p>
      </div>

      {/* Sub-scores Section */}
      <div className="flex justify-around items-center pt-4 border-t border-gray-200 dark:border-gray-700">
        {avgScoresData.subScores.map((score) => (
          <div key={score.label} className="text-center">
            <div className="flex items-center gap-2 justify-center">
               <span className="h-2 w-2 rounded-full" style={{ backgroundColor: score.color }}></span>
               <p className="font-semibold text-gray-700 dark:text-gray-200">{score.value}</p>
            </div>
            <p className="text-xs text-gray-500">{score.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};