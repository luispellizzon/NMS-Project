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
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-800 dark:text-blue-300',
        label: 'Started',
      },
      in_progress: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-800 dark:text-yellow-300',
        label: 'In Progress',
      },
      completed: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-300',
        label: 'Completed',
      },
      failed: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-300',
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="text-red-600 dark:text-red-400">
          <p className="font-semibold">Error loading training history</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={fetchHistory}
            className="mt-3 text-sm px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Training History
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {history.length} training run{history.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
        <button
          onClick={fetchHistory}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Refresh
        </button>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
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
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                  Training ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                  Triggered
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                  Dataset Size
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                  Metrics
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                  Duration
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {history.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="text-sm font-mono text-gray-800 dark:text-gray-200">
                      {log.id.substring(0, 8)}...
                    </div>
                    {log.hfSpaceUrl && (
                      <a
                        href={log.hfSpaceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View on HF
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(log.triggeredAt)}
                  </td>
                  <td className="px-4 py-4">{getStatusBadge(log.status)}</td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-800 dark:text-gray-200">
                      {log.datasetSize.totalRecords.toLocaleString()} total
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      +{log.datasetSize.newRecords} new
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {log.trainingMetrics ? (
                      <div className="text-sm space-y-1">
                        {log.trainingMetrics.accuracy !== undefined && (
                          <div className="text-gray-800 dark:text-gray-200">
                            Acc: {(log.trainingMetrics.accuracy * 100).toFixed(2)}%
                          </div>
                        )}
                        {log.trainingMetrics.valAccuracy !== undefined && (
                          <div className="text-xs text-gray-500 dark:text-gray-500">
                            Val: {(log.trainingMetrics.valAccuracy * 100).toFixed(2)}%
                          </div>
                        )}
                        {log.trainingMetrics.epochs !== undefined && (
                          <div className="text-xs text-gray-500 dark:text-gray-500">
                            {log.trainingMetrics.epochs} epochs
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 dark:text-gray-600">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {log.completedAt ? (
                      <div>
                        <div>{formatDuration(log.trainingMetrics?.duration)}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {formatDate(log.completedAt)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-600">In progress...</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Error details for failed trainings */}
          {history.some((log) => log.status === 'failed' && log.error) && (
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Failed Training Details:
              </h3>
              {history
                .filter((log) => log.status === 'failed' && log.error)
                .map((log) => (
                  <div
                    key={log.id}
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3"
                  >
                    <p className="text-xs font-mono text-red-800 dark:text-red-300">
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