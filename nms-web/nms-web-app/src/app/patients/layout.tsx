// src/app/patients/layout.tsx
'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import FullScreenLoader from '@/components/ui/common/FullScreenLoader';

export default function ProtectedPatientsLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <FullScreenLoader />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}