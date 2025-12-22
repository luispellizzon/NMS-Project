'use client';

import Link from 'next/link';
import {
  LayoutGrid, Users, ClipboardList, Bell, Settings, LogOut,
  ChevronsLeft, ChevronsRight, LucideProps, X
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { logOut } from '@/lib/firebase/auth-service';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  isMobileOpen: boolean;
  setMobileOpen: (isOpen: boolean) => void;
}

const textVariants = {
  hidden: { opacity: 0, x: -10, width: 0, transition: { duration: 0.1 } },
  visible: { opacity: 1, x: 0, width: 'auto', transition: { duration: 0.2, delay: 0.1 } },
};

const NavLink = ({ href, icon: Icon, text, isCollapsed, isSelected = false }: {
  href: string;
  icon: React.ComponentType<LucideProps>;
  text: string;
  isCollapsed: boolean;
  isSelected?: boolean;
}) => (
  <Link
    href={href}
    className={`flex items-center px-4 py-3 rounded-md transition-colors duration-200 ${
      isSelected
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
    }`}
  >
    <Icon className="h-5 w-5 flex-shrink-0" />
    <AnimatePresence>
      {!isCollapsed && (
        <motion.span
          variants={textVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="ml-4 font-medium whitespace-nowrap overflow-hidden"
        >
          {text}
        </motion.span>
      )}
    </AnimatePresence>
  </Link>
);

export default function Sidebar({ isCollapsed, toggleSidebar, isMobileOpen, setMobileOpen }: SidebarProps) {
  const sidebarWidth = isCollapsed ? '80px' : '256px';

  return (
    <>
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full w-64 bg-background border-r flex flex-col z-40 lg:hidden"
            >
              <SidebarContent
                isCollapsed={false}
                toggleSidebar={toggleSidebar}
                isMobile={true}
                setMobileOpen={setMobileOpen}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      
      <motion.aside
        animate={{ width: sidebarWidth }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden lg:fixed lg:top-0 lg:left-0 lg:h-full bg-card border-r lg:flex flex-col z-20"
      >
        <SidebarContent isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      </motion.aside>
    </>
  );
}

const SidebarContent = ({
  isCollapsed,
  toggleSidebar,
  isMobile = false,
  setMobileOpen
}: {
  isCollapsed: boolean,
  toggleSidebar: () => void,
  isMobile?: boolean,
  setMobileOpen?: (isOpen: boolean) => void
}) => {
  const router = useRouter();
  const pathname = usePathname(); // Get the current path
  const { user } = useAuth(); // Get the currently logged-in user

  // --- 4. Create the logout handler ---
  const handleLogout = async () => {
    try {
      await logOut();
      // On successful logout, redirect to the sign-in page.
      router.push('/signin');
    } catch (error) {
      console.error("Failed to log out:", error);
      // Optionally, show an error message to the user
    }
  };

  return (
  <>
    <div className="flex items-center justify-between p-4 border-b h-16 shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="">
              <Image src="/images/logo.png" alt="NeuroMind Logo" width={44} height={44} />
          </div>
          {(!isCollapsed || isMobile) && (
            <span className="text-xl font-bold text-foreground whitespace-nowrap">
              NeuroMind
            </span>
          )}
        </div>
        
        {isMobile ? (
          <button onClick={() => setMobileOpen?.(false)} className="p-2 rounded-lg text-muted-foreground hover:bg-accent" aria-label="Close menu">
            <X className="h-6 w-6" />
          </button>
        ) : (
          <button onClick={toggleSidebar} className="p-2 rounded-lg text-muted-foreground hover:bg-accent" aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {isCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
          </button>
        )}
      </div>

    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
      <p className={`px-4 pt-2 pb-2 text-xs font-semibold text-muted-foreground/80 uppercase transition-opacity duration-200 ${isCollapsed ? 'opacity-0 h-0 pointer-events-none' : 'opacity-100'}`}>Menu</p>
      <NavLink href="/dashboard" icon={LayoutGrid} text="Dashboard" isCollapsed={isCollapsed} isSelected={pathname === '/dashboard'} />
      <NavLink href="/patients" icon={Users} text="Patients" isCollapsed={isCollapsed} isSelected={pathname === '/patients'} />
      <NavLink href="/training" icon={ClipboardList} text="Training" isCollapsed={isCollapsed} isSelected={pathname === '/training'} />
    </nav>

    <div className="p-4 border-t shrink-0">
      <div className="space-y-2">
        <NavLink href="/notifications" icon={Bell} text="Notifications" isCollapsed={isCollapsed} isSelected={pathname === '/notifications'} />
        <NavLink href="/settings" icon={Settings} text="Settings" isCollapsed={isCollapsed} isSelected={pathname === '/settings'} />
      </div>
      <div className="mt-6">
        <div className="flex items-center p-2">
          {/* Use user's photoURL or a default avatar */}
          <Image src={user?.photoURL || "/images/logo.png"} alt={user?.displayName || 'User'} className="w-10 h-10 rounded-full flex-shrink-0" width={40} height={40} />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div variants={textVariants} initial="hidden" animate="visible" exit="hidden" className="ml-3 overflow-hidden">
                {/* Display dynamic user info */}
                <p className="font-semibold text-foreground text-sm whitespace-nowrap">{user?.displayName || 'Medical Professional'}</p>
                <p className="text-xs text-muted-foreground whitespace-nowrap">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* --- 5. Attach the handler to the button's onClick event --- */}
        <button onClick={handleLogout} className={`w-full flex items-center mt-4 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground ${isCollapsed ? 'justify-center' : ''}`}>
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span variants={textVariants} initial="hidden" animate="visible" exit="hidden" className="ml-4 font-medium whitespace-nowrap overflow-hidden">Log out</motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  </>
  );
};