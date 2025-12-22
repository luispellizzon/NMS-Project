// src/components/ui/patients/RiskScoreBadge.tsx
import { RiskLevel } from '@/types/patient';

interface RiskScoreBadgeProps {
  score: number;
  level: RiskLevel;
}

const levelClasses: Record<RiskLevel, string> = {
  High: 'bg-red-200 text-red-800 dark:bg-red-900/70 dark:text-red-200',
  Moderate: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900/70 dark:text-yellow-200',
  Low: 'bg-teal-200 text-teal-800 dark:bg-teal-900/70 dark:text-teal-200',
};

export default function RiskScoreBadge({ score, level }: RiskScoreBadgeProps) {
  return (
    <div className={`px-3 py-1.5 rounded-md text-sm font-semibold flex-shrink-0 ${levelClasses[level]}`}>
      {score.toFixed(1)} / 10
    </div>
  );
}