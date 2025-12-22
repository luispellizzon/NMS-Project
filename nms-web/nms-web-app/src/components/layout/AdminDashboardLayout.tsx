// src/components/layout/AdminDashboardLayout.tsx
'use client';

import { useState, ReactNode } from 'react';
import AdminSidebar from '@/components/layout/AdminSideBar';
import Header from './Header';

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleDesktopSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const toggleMobileSidebar = () => setMobileSidebarOpen(!isMobileSidebarOpen);

  return (
    <div className="flex h-screen bg-muted/40 dark:bg-background">
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleDesktopSidebar}
        isMobileOpen={isMobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />
      <div
        className={`flex flex-1 flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <Header onToggleMobileSidebar={toggleMobileSidebar} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
