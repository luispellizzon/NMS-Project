'use client';

import { Search, X } from 'lucide-react';

// Define the props for our generic component
interface GenericSearchBarProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void; // Optional handler to clear the input
  placeholder?: string;
  className?: string; // To allow for custom styling
  iconClassName?: string;
}

export default function GenericSearchBar({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  className = '',
  iconClassName = 'h-4 w-5 text-gray-400',
}: GenericSearchBarProps) {
  return (
    <div className="relative w-full">
      {/* Search Icon on the left */}
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className={iconClassName} aria-hidden="true" />
      </div>

      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        // Base styles with padding adjusted for both left and right icons
        className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 ${className}`}
      />

      {/* Clear Button (X icon) on the right */}
      {/* This button only appears if there is a value AND an onClear function is provided */}
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
    </div>
  );
}