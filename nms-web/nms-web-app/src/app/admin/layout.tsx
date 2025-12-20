// src/app/admin/layout.tsx
'use client';

import { ReactNode } from 'react';
import RoleGuard from '@/components/auth/RoleGuard';
import AdminDashboardLayout from '@/components/layout/AdminDashboardLayout';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard
      allowedRoles={['admin']}
      redirectUnauthorized="/dashboard"
    >
      <AdminDashboardLayout>{children}</AdminDashboardLayout>
    </RoleGuard>
  );
}
