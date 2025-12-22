// src/components/ui/training/TrainingHistory.tsx
'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Clock, Download, Eye, Trash2 } from 'lucide-react';

interface TrainingHistoryItem {
  id: string;
  modelType: string;
  status: 'completed' | 'failed' | 'stopped';
  accuracy: number;
  loss: number;
  epochs: number;
  duration: string;
  startDate: string;
  endDate: string;
}

export default function TrainingHistory() {
  const [history, setHistory] = useState<TrainingHistoryItem[]>([
    {
      id: 'job-045',
      modelType: 'Combined Multi-Modal Model',
      status: 'completed',
      accuracy: 0.912,
      loss: 0.187,
      epochs: 100,
      duration: '4h 23m',
      startDate: '2025-11-15 14:30',
      endDate: '2025-11-15 18:53',
    },
    {
      id: 'job-044',
      modelType: 'Speech Analysis Model',
      status: 'completed',
      accuracy: 0.847,
      loss: 0.312,
      epochs: 50,
      duration: '2h 10m',
      startDate: '2025-11-14 10:00',
      endDate: '2025-11-14 12:10',
    },
    {
      id: 'job-043',
      modelType: 'Questionnaire Risk Model',
      status: 'completed',
      accuracy: 0.893,
      loss: 0.223,
      epochs: 75,
      duration: '1h 45m',
      startDate: '2025-11-13 16:15',
      endDate: '2025-11-13 18:00',
    },
    {
      id: 'job-042',
      modelType: 'Cognitive Test Model',
      status: 'failed',
      accuracy: 0.652,
      loss: 0.891,
      epochs: 30,
      duration: '0h 55m',
      startDate: '2025-11-12 09:00',
      endDate: '2025-11-12 09:55',
    },
    {
      id: 'job-041',
      modelType: 'Speech Analysis Model',
      status: 'stopped',
      accuracy: 0.721,
      loss: 0.567,
      epochs: 25,
      duration: '1h 05m',
      startDate: '2025-11-11 13:20',
      endDate: '2025-11-11 14:25',
    },
  ]);

  const [selectedJob, setSelectedJob] = useState<TrainingHistoryItem | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'stopped':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-3 py-1 text-sm rounded-full font-medium';
    switch (status) {
      case 'completed':
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>Completed</span>
        );
      case 'failed':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Failed</span>;
      case 'stopped':
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Stopped</span>
        );
      default:
        return null;
    }
  };

  const handleDelete = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleDownload = (job: TrainingHistoryItem) => {
    // Implement model download logic
    console.log('Downloading model:', job.id);
  };

  const handleView = (job: TrainingHistoryItem) => {
    setSelectedJob(job);
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Jobs</p>
          <p className="text-3xl font-bold text-foreground">{history.length}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Completed</p>
          <p className="text-3xl font-bold text-green-600">
            {history.filter((h) => h.status === 'completed').length}
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Failed</p>
          <p className="text-3xl font-bold text-red-600">
            {history.filter((h) => h.status === 'failed').length}
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Best Accuracy</p>
          <p className="text-3xl font-bold text-foreground">
            {(
              Math.max(...history.map((h) => h.accuracy)) * 100
            ).toFixed(1)}
            %
          </p>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Job ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Model Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Accuracy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Loss
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {history.map((job) => (
                <tr key={job.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {job.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {job.modelType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(job.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {(job.accuracy * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {job.loss.toFixed(3)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {job.duration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {job.endDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(job)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {job.status === 'completed' && (
                        <button
                          onClick={() => handleDownload(job)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Download Model"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-foreground">Job Details</h3>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Job ID</p>
                  <p className="text-foreground font-medium">{selectedJob.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Model Type</p>
                  <p className="text-foreground font-medium">{selectedJob.modelType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Epochs</p>
                  <p className="text-foreground font-medium">{selectedJob.epochs}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-foreground font-medium">{selectedJob.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Final Accuracy</p>
                  <p className="text-foreground font-medium">
                    {(selectedJob.accuracy * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Final Loss</p>
                  <p className="text-foreground font-medium">{selectedJob.loss.toFixed(3)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="text-foreground font-medium">{selectedJob.startDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="text-foreground font-medium">{selectedJob.endDate}</p>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                {selectedJob.status === 'completed' && (
                  <button
                    onClick={() => handleDownload(selectedJob)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0d7377] text-white rounded-lg hover:bg-[#0a5c5f] transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Model
                  </button>
                )}
                <button
                  onClick={() => setSelectedJob(null)}
                  className="px-4 py-2 bg-background border border-border text-foreground rounded-lg hover:bg-accent transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}