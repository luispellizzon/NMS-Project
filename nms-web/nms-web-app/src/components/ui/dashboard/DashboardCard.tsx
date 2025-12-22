// src/components/ui/dashboard/DashboardCard.tsx
import { ReactNode } from 'react';
import { motion, MotionProps } from 'framer-motion';

// Combine our component's props with Framer Motion's MotionProps
// This allows us to pass variants from the parent component.
type DashboardCardProps = {
  title: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
} & MotionProps;

export default function DashboardCard({ title, footer, children, className, ...props }: DashboardCardProps) {
  return (
    <motion.div
      {...props}
      className={`bg-card border rounded-lg shadow-sm flex flex-col ${className}`}
    >
      <div className="flex justify-between items-center p-4 border-b">
        {typeof title === 'string' 
          ? <h3 className="font-semibold text-lg text-card-foreground">{title}</h3> 
          : title
        }
      </div>
      <div className="flex-grow h-fit p-4">
        {children}
      </div>
      {footer && <div className="p-4 pt-0 mt-auto">{footer}</div>}
    </motion.div>
  );
}