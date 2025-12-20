// src/app/admin/data-export/page.tsx
'use client';

import { useState } from 'react';
import { Download, FileText, FileJson, CheckCircle } from 'lucide-react';
import { getFormattedExport } from '@/lib/firebase/services/data-export-service';
import { DataExportOptions } from '@/types/admin';

export default function DataExportPage() {
  const [options, setOptions] = useState<DataExportOptions>({
    includePatients: true,
    includeRiskAssessments: true,
    format: 'csv',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    filename?: string;
  } | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setResult(null);

    try {
      const { data, mimeType, filename } = await getFormattedExport(options);

      // Create download
      const blob = new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setResult({
        success: true,
        message: 'Export completed successfully',
        filename,
      });
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Export failed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Data Export</h1>
        <p className="text-muted-foreground">Export patient data for analysis and reporting</p>
      </div>

      <div className="bg-card rounded-lg border p-6 max-w-2xl">
        <h2 className="text-lg font-semibold mb-4">Export Options</h2>

        <div className="space-y-6">
          {/* Data Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">Include Data</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includePatients}
                  onChange={(e) => setOptions({ ...options, includePatients: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span>Patient Information (names, emails, demographics)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeRiskAssessments}
                  onChange={(e) => setOptions({ ...options, includeRiskAssessments: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span>Risk Assessments (scores, risk levels, MMSE scores)</span>
              </label>
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">Export Format</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setOptions({ ...options, format: 'csv' })}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                  options.format === 'csv'
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-primary/50'
                }`}
              >
                <FileText className={`h-5 w-5 ${options.format === 'csv' ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="text-left">
                  <p className="font-medium">CSV</p>
                  <p className="text-xs text-muted-foreground">Best for Excel, Sheets</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setOptions({ ...options, format: 'json' })}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                  options.format === 'json'
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-primary/50'
                }`}
              >
                <FileJson className={`h-5 w-5 ${options.format === 'json' ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="text-left">
                  <p className="font-medium">JSON</p>
                  <p className="text-xs text-muted-foreground">Best for developers</p>
                </div>
              </button>
            </div>
          </div>

          {/* Export Button */}
          <div className="pt-4">
            <button
              onClick={handleExport}
              disabled={loading || (!options.includePatients && !options.includeRiskAssessments)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export Data
                </>
              )}
            </button>
          </div>

          {/* Result Message */}
          {result && (
            <div className={`p-4 rounded-lg ${
              result.success
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              <div className="flex items-center gap-2">
                {result.success && <CheckCircle className="h-5 w-5" />}
                <span>{result.message}</span>
              </div>
              {result.filename && (
                <p className="text-sm mt-1 opacity-80">Downloaded: {result.filename}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-muted/50 rounded-lg p-6 max-w-2xl">
        <h3 className="font-medium mb-2">About Data Export</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Exports data from all doctors and their assigned patients</li>
          <li>• Includes patient demographics and risk assessment scores</li>
          <li>• CSV format can be opened in Excel or Google Sheets</li>
          <li>• JSON format is suitable for programmatic processing</li>
          <li>• Data is exported with proper escaping to prevent formatting issues</li>
        </ul>
      </div>
    </div>
  );
}
