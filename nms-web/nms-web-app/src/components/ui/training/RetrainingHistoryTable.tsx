'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface RetrainingLog {
  id: string;
  triggeredBy: string;
  triggeredAt: string;
  status: 'started' | 'in_progress' | 'completed' | 'failed';
  datasetSize: {
    baseRecords: number;
    newRecords: number;
    totalRecords: number;
  };
  trainingMetrics?: {
    accuracy?: number;
    loss?: number;
    valAccuracy?: number;
    valLoss?: number;
    epochs?: number;
    duration?: number;
  };
  completedAt?: string;
  error?: string;
  hfSpaceUrl?: string;
}

interface RetrainingHistoryTableProps {
  refreshTrigger?: number;
}

export default function RetrainingHistoryTable({
  refreshTrigger = 0,
}: RetrainingHistoryTableProps) {
  const [history, setHistory] = useState<RetrainingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [refreshTrigger]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/model-retraining/history');

      if (!response.ok) {
        throw new Error('Failed to fetch retraining history');
      }

      const data = await response.json();
      setHistory(data.history);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: RetrainingLog['status']) => {
    const statusConfig = {
      started: {
        bg: 'bg-primary/10 border border-primary/20',
        text: 'text-primary',
        label: 'Started',
      },
      in_progress: {
        bg: 'bg-yellow-500/10 border border-yellow-500/20',
        text: 'text-yellow-600 dark:text-yellow-400',
        label: 'In Progress',
      },
      completed: {
        bg: 'bg-green-500/10 border border-green-500/20',
        text: 'text-green-700 dark:text-green-300',
        label: 'Completed',
      },
      failed: {
        bg: 'bg-destructive/10 border border-destructive/20',
        text: 'text-destructive',
        label: 'Failed',
      },
    };

    const config = statusConfig[status];

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-16 bg-muted rounded"></div>
          <div className="h-16 bg-muted rounded"></div>
          <div className="h-16 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-md p-6">
        <div className="text-destructive">
          <p className="font-semibold">Error loading training history</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={fetchHistory}
            className="mt-3 text-sm px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card border border-border rounded-lg shadow-md p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Training History
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {history.length} training run{history.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
        <button
          onClick={fetchHistory}
          className="text-sm text-primary hover:underline"
        >
          Refresh
        </button>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <svg
            className="mx-auto h-12 w-12 text-muted-foreground mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="font-medium">No training history yet</p>
          <p className="text-sm mt-2">Trigger a model retraining to see results here</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground uppercase">
                  Training ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground uppercase">
                  Triggered
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground uppercase">
                  Dataset Size
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground uppercase">
                  Metrics
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground uppercase">
                  Duration
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {history.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="text-sm font-mono text-foreground">
                      {log.id.substring(0, 8)}...
                    </div>
                    {log.hfSpaceUrl && (
                      <a
                        href={log.hfSpaceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        View on HF
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {formatDate(log.triggeredAt)}
                  </td>
                  <td className="px-4 py-4">{getStatusBadge(log.status)}</td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-foreground">
                      {log.datasetSize.totalRecords.toLocaleString()} total
                    </div>
                    <div className="text-xs text-muted-foreground">
                      +{log.datasetSize.newRecords} new
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {log.trainingMetrics ? (
                      <div className="text-sm space-y-1">
                        {log.trainingMetrics.accuracy !== undefined && (
                          <div className="text-foreground">
                            Acc: {(log.trainingMetrics.accuracy * 100).toFixed(2)}%
                          </div>
                        )}
                        {log.trainingMetrics.valAccuracy !== undefined && (
                          <div className="text-xs text-muted-foreground">
                            Val: {(log.trainingMetrics.valAccuracy * 100).toFixed(2)}%
                          </div>
                        )}
                        {log.trainingMetrics.epochs !== undefined && (
                          <div className="text-xs text-muted-foreground">
                            {log.trainingMetrics.epochs} epochs
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {log.completedAt ? (
                      <div>
                        <div>{formatDuration(log.trainingMetrics?.duration)}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(log.completedAt)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">In progress...</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Error details for failed trainings */}
          {history.some((log) => log.status === 'failed' && log.error) && (
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                Failed Training Details:
              </h3>
              {history
                .filter((log) => log.status === 'failed' && log.error)
                .map((log) => (
                  <div
                    key={log.id}
                    className="bg-destructive/10 border border-destructive/20 rounded p-3"
                  >
                    <p className="text-xs font-mono text-destructive">
                      {log.id.substring(0, 8)}... - {log.error}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}