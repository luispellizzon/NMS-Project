// src/app/training/page.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  Settings,
  Activity,
  History,
  FileUp,
  Eye,
  CheckCircle,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import TrainingConfig from '@/components/ui/training/TrainingConfig';
import TrainingMonitor from '@/components/ui/training/TrainingMonitor';
import TrainingHistory from '@/components/ui/training/TrainingHistory';

type TabType = 'data' | 'config' | 'monitor' | 'history';

interface PendingReview {
  id: string;
  type: string;
  recordCount: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState<TabType>('data');
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([
    { id: '1', type: 'Questionnaire', recordCount: 45, date: '2025-10-01', status: 'pending' },
    { id: '2', type: 'Speech Sample', recordCount: 38, date: '2025-09-28', status: 'pending' },
    { id: '3', type: 'Cognitive Test', recordCount: 52, date: '2025-09-25', status: 'pending' },
  ]);

  const stats = {
    totalRecords: 15847,
    anonymized: 15847,
    speechSamples: 12305,
    questionnaires: 15847,
  };

  const handleReview = (id: string, action: 'approve' | 'reject') => {
    setPendingReviews((prev) =>
      prev.map((review) =>
        review.id === id
          ? { ...review, status: action === 'approve' ? 'approved' : 'rejected' }
          : review
      )
    );
  };

  const handleDelete = (id: string) => {
    setPendingReviews((prev) => prev.filter((review) => review.id !== id));
  };

  const tabs = [
    { id: 'data' as TabType, label: 'Data Management', icon: Database },
    { id: 'config' as TabType, label: 'Training Config', icon: Settings },
    { id: 'monitor' as TabType, label: 'Monitor', icon: Activity },
    { id: 'history' as TabType, label: 'History', icon: History },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Model Training Dashboard
          </h1>
          <p className="text-muted-foreground">
            Train and manage NMS AI models with anonymized patient data
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-8">
          <div className="flex gap-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#0d7377] text-[#0d7377]'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'data' && (
            <motion.div
              key="data"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-card border border-border rounded-lg p-6">
                  <p className="text-sm text-muted-foreground mb-1">Total Records</p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.totalRecords.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600 mt-1">+234</p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                  <p className="text-sm text-muted-foreground mb-1">Anonymized</p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.anonymized.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600 mt-1">100%</p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                  <p className="text-sm text-muted-foreground mb-1">Speech Samples</p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.speechSamples.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600 mt-1">+189</p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                  <p className="text-sm text-muted-foreground mb-1">Questionnaires</p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.questionnaires.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600 mt-1">+234</p>
                </div>
              </div>

              {/* Pending Data Review */}
              <div className="bg-card border border-border rounded-lg p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">
                    Pending Data Review
                  </h2>
                  <button className="px-4 py-2 bg-[#0d7377] text-white rounded-lg hover:bg-[#0a5c5f] transition-colors">
                    Review All
                  </button>
                </div>

                <div className="space-y-4">
                  {pendingReviews.map((review) => (
                    <div
                      key={review.id}
                      className="flex items-center justify-between p-4 bg-background rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-4">
                        <Database className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium text-foreground">{review.type}</h3>
                          <p className="text-sm text-muted-foreground">
                            {review.recordCount} records • {review.date}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                          Pending Review
                        </span>
                        <button
                          onClick={() => handleReview(review.id, 'approve')}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleReview(review.id, 'approve')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upload Anonymized Data */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  Upload Anonymized Data
                </h2>

                <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-[#0d7377] transition-colors cursor-pointer">
                  <FileUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-foreground font-medium mb-2">
                    Drop files here or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports CSV, JSON (max 100MB per file)
                  </p>
                </div>

                <div className="mt-4 flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    All uploaded data must be pre-anonymized. Personal identifiers will be
                    automatically stripped.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'config' && (
            <motion.div
              key="config"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <TrainingConfig />
            </motion.div>
          )}

          {activeTab === 'monitor' && (
            <motion.div
              key="monitor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <TrainingMonitor />
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <TrainingHistory />
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}