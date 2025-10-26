'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import FullScreenLoader from '@/components/ui/common/FullScreenLoader';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If the auth check is complete (`!loading`) and there is no user,
    // redirect them to the sign-in page.
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  // While the authentication state is being checked, display a full-screen loader.
  // Also, if there's no user, continue showing the loader until the redirect kicks in.
  if (loading || !user) {
    return <FullScreenLoader />;
  }

  // If the checks pass and a user exists, render the dashboard with its layout.
  return <DashboardLayout>{children}</DashboardLayout>;
}