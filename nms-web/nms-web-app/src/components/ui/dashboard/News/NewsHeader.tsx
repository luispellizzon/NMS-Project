'use client';

import { Search, FileText } from 'lucide-react';

export enum NewsMode {
  FilterExisting,
  QueryNewReport,
}

interface NewsHeaderProps {
  newsMode: NewsMode;
  onModeChange: (mode: NewsMode) => void;
}

export default function NewsHeader({ newsMode, onModeChange }: NewsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-border mb-4">
      <div>
        <h3 className="font-semibold text-lg text-card-foreground">Agent News & Research</h3>
        <p className="text-sm text-muted-foreground">Filter existing documents or query for new reports.</p>
      </div>
      <div className="flex items-center gap-2 mt-3 sm:mt-0">
        <button
          onClick={() => onModeChange(NewsMode.FilterExisting)}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
            newsMode === NewsMode.FilterExisting
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-accent'
          }`}
        >
          <Search className="w-4 h-4" />
          Filter Existing
        </button>
        <button
          onClick={() => onModeChange(NewsMode.QueryNewReport)}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
            newsMode === NewsMode.QueryNewReport
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-accent'
          }`}
        >
          <FileText className="w-4 h-4" />
          Query New Report
        </button>
      </div>
    </div>
  );
}