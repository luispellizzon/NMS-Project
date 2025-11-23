// src/app/training/page.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  Settings,
  Activity,
  History,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import TrainingConfig from '@/components/ui/training/TrainingConfig';
import TrainingMonitor from '@/components/ui/training/TrainingMonitor';
import TrainingHistory from '@/components/ui/training/TrainingHistory';
import DatasetOverviewCard from '@/components/ui/training/DatasetOverviewCard';
import PatientSelectionTable from '@/components/ui/training/PatientSelectionTable';
import ModelRetrainingPanel from '@/components/ui/training/ModelRetrainingPanel';
import RetrainingHistoryTable from '@/components/ui/training/RetrainingHistoryTable';

type TabType = 'data' | 'config' | 'monitor' | 'history';

export default function TrainingPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('data');
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([]);
  const [retrainingRefreshTrigger, setRetrainingRefreshTrigger] = useState(0);

  const handleAnonymize = async (patientIds: string[]) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const response = await fetch('/api/anonymization/anonymize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientIds,
        doctorId: user.uid,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Anonymization failed');
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Anonymization failed');
    }

    alert(
      `Successfully anonymized ${result.successCount} patient(s)!\n` +
        (result.failureCount > 0 ? `${result.failureCount} failed.` : '')
    );

    return result;
  };

  const handleRetrainingStarted = () => {
    setRetrainingRefreshTrigger((prev) => prev + 1);
  };

  const tabs = [
    { id: 'data' as TabType, label: 'Data Management', icon: Database },
    { id: 'config' as TabType, label: 'Training Config', icon: Settings },
    { id: 'monitor' as TabType, label: 'Monitor', icon: Activity },
    { id: 'history' as TabType, label: 'History', icon: History },
  ];

  return (
    <div className="min-h-screen bg-background">
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
              className="space-y-6"
            >
              {/* Dataset Overview */}
              <DatasetOverviewCard />

              {/* Patient Selection for Anonymization */}
              {user && (
                <PatientSelectionTable
                  doctorId={user.uid}
                  onSelectionChange={setSelectedPatientIds}
                  onAnonymize={handleAnonymize}
                />
              )}

              {/* Model Retraining Panel */}
              {user && (
                <ModelRetrainingPanel
                  doctorId={user.uid}
                  onRetrainingStarted={handleRetrainingStarted}
                />
              )}

              {/* Retraining History */}
              <RetrainingHistoryTable refreshTrigger={retrainingRefreshTrigger} />
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