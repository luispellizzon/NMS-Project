// src/app/training/layout.tsx
import { Metadata } from 'next';
import DashboardLayout from '@/components/layout/DashboardLayout';

export const metadata: Metadata = {
  title: 'Model Training | NMS',
  description: 'Train and manage NMS AI models',
};

export default function TrainingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}