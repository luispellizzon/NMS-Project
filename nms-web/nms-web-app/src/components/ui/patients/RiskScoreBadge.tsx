// src/components/ui/patients/RiskScoreBadge.tsx
import { RiskLevel } from '@/types/patient';

interface RiskScoreBadgeProps {
  score: number;
  level: RiskLevel;
}

const levelClasses: Record<RiskLevel, string> = {
  High: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  Moderate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
  Low: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-400',
};

export default function RiskScoreBadge({ score, level }: RiskScoreBadgeProps) {
  return (
    <div className={`px-3 py-1.5 rounded-md text-sm font-semibold flex-shrink-0 ${levelClasses[level]}`}>
      {score.toFixed(1)} / 10
    </div>
  );
}