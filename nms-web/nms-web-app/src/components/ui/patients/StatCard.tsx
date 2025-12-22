// src/components/ui/patients/StatCard.tsx
import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: ReactNode;
}

export default function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'tween', stiffness: 300 }}
      className="bg-card p-5 rounded-lg border shadow-sm"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon}
      </div>
      <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
    </motion.div>
  );
}