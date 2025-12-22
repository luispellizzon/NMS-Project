// src/components/ui/patients/ScoreCard.tsx
import { motion } from 'framer-motion';

interface ScoreCardProps {
  title: string;
  score: number;
  maxScore: number;
  status: string;
  statusColor: string;
}

export default function ScoreCard({ title, score, maxScore, status, statusColor }: ScoreCardProps) {
  const isTestCompleted = maxScore > 0;

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
      className="bg-card border rounded-lg p-6 text-center"
    >
      <p className="text-muted-foreground mb-2">{title}</p>
      {isTestCompleted ? (
        <>
          <p className="text-4xl font-bold text-primary">
            {score}
            <span className="text-2xl text-muted-foreground">/{maxScore}</span>
          </p>
          <p className="mt-2 text-sm font-semibold" style={{ color: statusColor }}>
            {status}
          </p>
        </>
      ) : (
        <p className="text-2xl font-bold text-muted-foreground mt-4">Not Completed</p>
      )}
    </motion.div>
  );
}