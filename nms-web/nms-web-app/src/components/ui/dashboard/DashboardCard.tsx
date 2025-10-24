import { ReactNode } from 'react';

type DashboardCardProps = {
  title: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function DashboardCard({ title, footer, children, className }: DashboardCardProps) {
  return (
    <div className={`bg-gray-800/20 dark:bg-gray-800/50 p-4 rounded-lg shadow-md flex flex-col ${className}`}>
      {/* Card Header */}
      <div className="flex justify-between items-center mb-4">
        {typeof title === 'string' 
          ? <h3 className="font-bold text-lg text-gray-800 dark:text-white">{title}</h3> 
          : title
        }
      </div>

      {/* Card Body - Stretches to fill available space */}
      <div className="flex-grow h-full">
        {children}
      </div>

      {/* Card Footer */}
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
}