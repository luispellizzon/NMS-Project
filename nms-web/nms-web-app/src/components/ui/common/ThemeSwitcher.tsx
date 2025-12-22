// src/components/ui/common/ThemeSwitcher.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10 sm:w-[120px] bg-muted rounded-md animate-pulse" />;
  }

  const themes = [
    { name: 'Light', value: 'light', icon: Sun },
    { name: 'Dark', value: 'dark', icon: Moon },
    { name: 'System', value: 'system', icon: Monitor },
  ];

  const CurrentTheme = themes.find((t) => t.value === theme) || themes[2];

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center sm:justify-between w-10 h-10 sm:w-[120px] p-2 sm:px-3 sm:py-2 bg-accent border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <CurrentTheme.icon className="h-5 w-5 text-muted-foreground" />
          <span className="hidden sm:inline text-sm">{CurrentTheme.name}</span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute top-full right-0 mt-2 w-32 bg-popover border border-border rounded-md shadow-lg z-10 overflow-hidden"
          >
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => {
                  setTheme(t.value);
                  setIsOpen(false);
                }}
                className={`flex items-center w-full px-3 py-2 text-left text-sm hover:bg-accent ${
                  theme === t.value ? 'bg-accent text-accent-foreground' : 'text-popover-foreground'
                }`}
              >
                <t.icon className="h-5 w-5 mr-2 text-muted-foreground" />
                {t.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
