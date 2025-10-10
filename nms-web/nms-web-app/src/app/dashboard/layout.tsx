import DashboardLayout from '@/components/layout/DashboardLayout';
import { ReactNode } from 'react';

export default function LayoutForDashboard({ children }: { children: ReactNode }) {
  // This layout wraps every page inside the /dashboard route
  return <DashboardLayout>{children}</DashboardLayout>;
}