'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import FullScreenLoader from '@/components/ui/common/FullScreenLoader';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, loading, userRole, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If the auth check is complete (`!loading`) and there is no user,
    // redirect them to the sign-in page.
    if (!loading && !user) {
      router.push('/signin');
      return;
    }

    // Redirect admins to the admin dashboard
    if (!loading && user && isAdmin) {
      router.push('/admin/dashboard');
      return;
    }

    // Redirect non-doctors to the homepage
    // Only redirect if userRole has been determined (not null) to avoid race conditions
    if (!loading && user && userRole !== null && userRole !== "doctor") {
          router.push('/');
          return;
        }
  }, [user, loading, userRole, isAdmin, router]);

  // While the authentication state is being checked, display a full-screen loader.
  // Also, if there's no user or userRole hasn't been determined, continue showing the loader.
  if (loading || !user || userRole === null) {
    return <FullScreenLoader />;
  }

  // If user is admin, show loader while redirecting
  if (isAdmin) {
    return <FullScreenLoader />;
  }

  // If the checks pass and a user exists, render the dashboard with its layout.
  return <DashboardLayout>{children}</DashboardLayout>;
}