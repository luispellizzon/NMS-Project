'use client';

import { CheckCircle, FileText } from 'lucide-react';

interface GenerationCompleteViewProps {
  topic: string;
  onViewReport: () => void;
}

export default function GenerationCompleteView({ topic, onViewReport }: GenerationCompleteViewProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[300px] space-y-6">
      <div className="relative">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center animate-pulse">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <div className="absolute inset-0 w-20 h-20 bg-green-500/20 rounded-full animate-ping" />
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Report Generated Successfully!</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          The AI agents have completed their research on <span className="font-medium text-foreground">{topic}</span> and
          generated a comprehensive report.
        </p>
      </div>

      <button
        onClick={onViewReport}
        className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform"
      >
        <FileText className="w-5 h-5" />
        View Report
      </button>

      <p className="text-xs text-muted-foreground">
        The report has been saved and is ready to view
      </p>
    </div>
  );
}