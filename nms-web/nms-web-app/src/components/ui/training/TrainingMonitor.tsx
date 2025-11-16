// src/components/ui/training/TrainingMonitor.tsx
'use client';

import { useState, useEffect } from 'react';
import { Activity, Pause, Square, TrendingUp, Clock, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrainingJob {
  id: string;
  modelType: string;
  status: 'running' | 'paused' | 'completed' | 'failed';
  currentEpoch: number;
  totalEpochs: number;
  accuracy: number;
  loss: number;
  startTime: string;
  estimatedTimeRemaining: string;
}

export default function TrainingMonitor() {
  const [activeJob, setActiveJob] = useState<TrainingJob | null>({
    id: 'job-001',
    modelType: 'Speech Analysis Model',
    status: 'running',
    currentEpoch: 23,
    totalEpochs: 50,
    accuracy: 0.847,
    loss: 0.312,
    startTime: '2025-11-16 18:30:00',
    estimatedTimeRemaining: '1h 15m',
  });

  // Mock training history data
  const trainingData = [
    { epoch: 1, accuracy: 0.45, loss: 1.2, valAccuracy: 0.42, valLoss: 1.3 },
    { epoch: 5, accuracy: 0.62, loss: 0.95, valAccuracy: 0.60, valLoss: 1.0 },
    { epoch: 10, accuracy: 0.71, loss: 0.75, valAccuracy: 0.68, valLoss: 0.82 },
    { epoch: 15, accuracy: 0.78, loss: 0.58, valAccuracy: 0.74, valLoss: 0.65 },
    { epoch: 20, accuracy: 0.83, loss: 0.42, valAccuracy: 0.79, valLoss: 0.50 },
    { epoch: 23, accuracy: 0.847, loss: 0.312, valAccuracy: 0.82, valLoss: 0.38 },
  ];

  const handlePause = () => {
    if (activeJob) {
      setActiveJob({ ...activeJob, status: 'paused' });
    }
  };

  const handleResume = () => {
    if (activeJob) {
      setActiveJob({ ...activeJob, status: 'running' });
    }
  };

  const handleStop = () => {
    setActiveJob(null);
  };

  if (!activeJob) {
    return (
      <div className="bg-card border border-border rounded-lg p-12 text-center">
        <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No Active Training Jobs
        </h3>
        <p className="text-muted-foreground">
          Start a new training job from the Training Config tab.
        </p>
      </div>
    );
  }

  const progress = (activeJob.currentEpoch / activeJob.totalEpochs) * 100;

  return (
    <div className="space-y-6">
      {/* Job Status Card */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-1">
              {activeJob.modelType}
            </h2>
            <p className="text-sm text-muted-foreground">Job ID: {activeJob.id}</p>
          </div>
          <div className="flex gap-2">
            {activeJob.status === 'running' ? (
              <button
                onClick={handlePause}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <Pause className="w-4 h-4" />
                Pause
              </button>
            ) : (
              <button
                onClick={handleResume}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Activity className="w-4 h-4" />
                Resume
              </button>
            )}
            <button
              onClick={handleStop}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Square className="w-4 h-4" />
              Stop
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Epoch {activeJob.currentEpoch} / {activeJob.totalEpochs}
            </span>
            <span className="text-sm font-medium text-foreground">{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className="bg-[#0d7377] h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Accuracy</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {(activeJob.accuracy * 100).toFixed(1)}%
            </p>
          </div>

          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-red-600" />
              <span className="text-sm text-muted-foreground">Loss</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{activeJob.loss.toFixed(3)}</p>
          </div>

          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">Started</span>
            </div>
            <p className="text-sm font-medium text-foreground">{activeJob.startTime}</p>
          </div>

          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-muted-foreground">Time Remaining</span>
            </div>
            <p className="text-sm font-medium text-foreground">
              {activeJob.estimatedTimeRemaining}
            </p>
          </div>
        </div>
      </div>

      {/* Training Metrics Chart */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Training Metrics</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={trainingData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="epoch" label={{ value: 'Epoch', position: 'insideBottom', offset: -5 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="accuracy"
              stroke="#0d7377"
              strokeWidth={2}
              name="Training Accuracy"
            />
            <Line
              type="monotone"
              dataKey="valAccuracy"
              stroke="#14B8A6"
              strokeWidth={2}
              name="Validation Accuracy"
            />
            <Line
              type="monotone"
              dataKey="loss"
              stroke="#EF4444"
              strokeWidth={2}
              name="Training Loss"
            />
            <Line
              type="monotone"
              dataKey="valLoss"
              stroke="#F97316"
              strokeWidth={2}
              name="Validation Loss"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* System Resources */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">System Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">GPU Usage</span>
              <span className="text-sm font-medium text-foreground">78%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Memory</span>
              <span className="text-sm font-medium text-foreground">12.4 / 16 GB</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '77.5%' }} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">CPU</span>
              <span className="text-sm font-medium text-foreground">45%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}