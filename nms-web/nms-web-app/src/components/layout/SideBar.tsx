// src/components/layout/Sidebar.ts
'use client';

import Link from 'next/link';
import {
  LayoutGrid,
  Users,
  ClipboardList,
  Bell,
  Settings,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  LucideProps,
} from 'lucide-react';
import Image from 'next/image';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}
type NavLinkProps = {
  href: string;
  icon: React.ComponentType<LucideProps>;
  text: string;
  isCollapsed: boolean;
  isSelected?: boolean;
};

const NavLink = ({ href, icon: Icon, text, isCollapsed, isSelected = false }: NavLinkProps) => (
  <Link
    href={href}
    className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${isSelected
        ? 'bg-[#0d7377] text-white'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
  >
    <Icon className="h-5 w-5" />
    {!isCollapsed && <span className="ml-4 font-medium">{text}</span>}
    {isSelected && !isCollapsed && (
      <span className="ml-auto bg-black text-white text-xs font-bold px-2 py-1 rounded-full">
        32
      </span>
    )}
  </Link>
);

export default function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-in-out z-40 ${isCollapsed ? 'w-20' : 'w-64'
        }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="bg-[#0d7377] p-2 rounded-lg">
              <svg /* Using an inline SVG for the brain logo */
                className="w-6 h-6 text-white"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.94.24 2.5 2.5 0 0 1-2.06-2.24 2.5 2.5 0 0 1 2-2.5 2.5 2.5 0 0 1 2-2.5 2.5 2.5 0 0 1 2-2.5 2.5 2.5 0 0 1 2-2.5 2.5 2.5 0 0 1 2.5-2.25" />
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.94.24 2.5 2.5 0 0 0 2.06-2.24 2.5 2.5 0 0 0-2-2.5 2.5 2.5 0 0 0-2-2.5 2.5 2.5 0 0 0-2-2.5 2.5 2.5 0 0 0-2-2.5 2.5 2.5 0 0 0-2.5-2.25" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-800 dark:text-white">NeuroMind</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {isCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <p className={`px-4 pt-2 pb-2 text-xs font-semibold text-gray-400 uppercase ${isCollapsed ? 'text-center' : ''}`}>Menu</p>
        <NavLink href="/dashboard" icon={LayoutGrid} text="Dashboard" isCollapsed={isCollapsed} isSelected />
        <NavLink href="/patients" icon={Users} text="Patients" isCollapsed={isCollapsed} />
        <NavLink href="/training" icon={ClipboardList} text="Training" isCollapsed={isCollapsed} />
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-2">
          <NavLink href="/notifications" icon={Bell} text="Notifications" isCollapsed={isCollapsed} />
          <NavLink href="/settings" icon={Settings} text="Settings" isCollapsed={isCollapsed} />
        </div>
        <div className="mt-6">
          <div className="flex items-center p-2 rounded-lg">
            <Image
              src="/images/logo.png"
              alt="Jenny Wilson"
              className="w-10 h-10 rounded-full"
              width={40}
              height={40}
            />
            {!isCollapsed && (
              <div className="ml-3">
                <p className="font-semibold text-gray-800 dark:text-white text-sm">Jenny Wilson</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">jen.wilson@exampl...</p>
              </div>
            )}
          </div>
          <button
            className={`w-full flex items-center mt-4 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 ${isCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span className="ml-4 font-medium">Log out</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
