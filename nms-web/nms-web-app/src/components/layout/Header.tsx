// src/components/layout/Header.tsx
'use client';

import GenericSearchBar from '@/components/ui/common/SearchBar';
import ThemeSwitcher from '@/components/ui/common/ThemeSwitcher';
import { useState } from 'react';
import { Bell, Menu } from 'lucide-react';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
}

export default function Header({ onToggleMobileSidebar }: HeaderProps) {
  const [headerSearchTerm, setHeaderSearchTerm] = useState('');
  const clearHeaderSearch = () => setHeaderSearchTerm('');

  return (
    <header className="flex items-center justify-between p-2.5 bg-card border-b">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-md text-muted-foreground hover:bg-accent"
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        {/* Search Bar - hide on smaller screens to make space */}
        <div className="hidden sm:block w-full max-w-xs">
          <GenericSearchBar
            value={headerSearchTerm}
            onChange={(e) => setHeaderSearchTerm(e.target.value)}
            onClear={clearHeaderSearch}
            placeholder="Search patients, reports..."
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4 pr-4">
        <ThemeSwitcher />
        <button className="p-2 rounded-full hover:bg-accent">
          <Bell className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}