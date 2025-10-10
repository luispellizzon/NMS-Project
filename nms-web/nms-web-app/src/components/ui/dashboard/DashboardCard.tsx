import { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  children: ReactNode;
  className?: string; // To allow for custom grid spanning
}

export default function DashboardCard({ title, children, className = '' }: DashboardCardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md ${className}`}>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">
        {title}
      </h3>
      <div>{children}</div>
    </div>
  );
}