'use client';

import { Search, X } from 'lucide-react';
import React from 'react'; // --> IMPORT React for FormEvent type

// Define the props for our generic component
interface GenericSearchBarProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void; // --> ADD THIS PROP
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  iconClassName?: string;
}

export default function GenericSearchBar({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder = 'Search...',
  className = '',
  iconClassName = 'h-4 w-5 text-gray-400',
}: GenericSearchBarProps) {
  return (
    <form onSubmit={onSubmit} className="relative w-full">
      {/* Search Icon on the left */}
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className={iconClassName} aria-hidden="true" />
      </div>

      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 ${className}`}
      />

      {/* Clear Button (X icon) on the right */}
      {value && onClear && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <button
            type="button"
            onClick={onClear}
            className="p-1 text-gray-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </form>
  );
}