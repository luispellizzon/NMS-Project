// src/components/auth/RoleGuard.tsx
'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/admin';
import FullScreenLoader from '@/components/ui/common/FullScreenLoader';

interface RoleGuardProps {
  /**
   * Roles allowed to access the protected content
   */
  allowedRoles: UserRole[];
  /**
   * Content to render if the user is authorized
   */
  children: ReactNode;
  /**
   * Custom fallback component while loading or redirecting
   */
  fallback?: ReactNode;
  /**
   * URL to redirect unauthenticated users (default: '/signin')
   */
  redirectUnauthenticated?: string;
  /**
   * URL to redirect unauthorized users (default: role-based dashboard)
   */
  redirectUnauthorized?: string;
}

/**
 * RoleGuard component for protecting routes based on user roles.
 *
 * Usage:
 * ```tsx
 * <RoleGuard allowedRoles={['admin']}>
 *   <AdminContent />
 * </RoleGuard>
 * ```
 */
export default function RoleGuard({
  allowedRoles,
  children,
  fallback,
  redirectUnauthenticated = '/signin',
  redirectUnauthorized,
}: RoleGuardProps) {
  const { user, loading, userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth state to be determined
    if (loading) return;

    // Redirect unauthenticated users to signin
    if (!user) {
      router.push(redirectUnauthenticated);
      return;
    }

    // Check if user has an allowed role
    if (userRole && !allowedRoles.includes(userRole)) {
      // Redirect to appropriate dashboard based on role
      const redirectUrl = redirectUnauthorized || getDefaultRedirect(userRole);
      router.push(redirectUrl);
    }
  }, [user, loading, userRole, allowedRoles, router, redirectUnauthenticated, redirectUnauthorized]);

  // Show loader while checking auth state
  if (loading) {
    return fallback || <FullScreenLoader />;
  }

  // Show loader while redirecting unauthenticated users
  if (!user) {
    return fallback || <FullScreenLoader />;
  }

  // Show loader while redirecting unauthorized users
  if (userRole && !allowedRoles.includes(userRole)) {
    return fallback || <FullScreenLoader />;
  }

  // Show loader if role is still being determined
  if (!userRole) {
    return fallback || <FullScreenLoader />;
  }

  // User is authenticated and authorized
  return <>{children}</>;
}

/**
 * Returns the default dashboard URL for a given role
 */
function getDefaultRedirect(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'doctor':
      return '/dashboard';
    case 'patient':
      return '/signin'; // Patients don't have web access, redirect to signin
    default:
      return '/signin';
  }
}
