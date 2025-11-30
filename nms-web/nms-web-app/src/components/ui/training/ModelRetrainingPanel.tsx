'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface ModelRetrainingPanelProps {
  doctorId: string;
  onRetrainingStarted?: () => void;
}

export default function ModelRetrainingPanel({
  doctorId,
  onRetrainingStarted,
}: ModelRetrainingPanelProps) {
  const [isRetraining, setIsRetraining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTrainingId, setLastTrainingId] = useState<string | null>(null);

  const handleTriggerRetraining = async () => {
    const confirmed = confirm(
      'Are you sure you want to trigger model retraining? This will use all anonymized patient data and may take several minutes.'
    );

    if (!confirmed) return;

    setIsRetraining(true);
    setError(null);

    try {
      const response = await fetch('/api/model-retraining/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to trigger retraining');
      }

      const data = await response.json();

      if (data.success) {
        setLastTrainingId(data.trainingId);
        alert(`Model retraining started successfully!\nTraining ID: ${data.trainingId}`);
        onRetrainingStarted?.();
      } else {
        throw new Error(data.message || 'Retraining failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsRetraining(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card border border-border rounded-lg shadow-md p-6"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Model Retraining
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Update the AI model with anonymized patient data
            </p>
          </div>
        </div>
      </div>

      {/* Process Overview */}
      <div className="bg-muted/50 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Retraining Process
        </h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="text-primary mt-0.5">•</span>
            <span>All anonymized patient data is sent to the Hugging Face Space</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="text-primary mt-0.5">•</span>
            <span>The model is retrained with the combined dataset (base + new records)</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="text-primary mt-0.5">•</span>
            <span>Training metrics are logged and tracked</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="text-primary mt-0.5">•</span>
            <span>The updated model is automatically deployed</span>
          </li>
        </ul>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg mb-6">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">
              Error
            </p>
            <p className="text-sm text-destructive/80 mt-1">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {lastTrainingId && (
        <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg mb-6">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              Training Started Successfully
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              Training ID: {lastTrainingId}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Check the training history below for status updates
            </p>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <button
          onClick={handleTriggerRetraining}
          disabled={isRetraining}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md w-full sm:w-auto"
        >
          {isRetraining ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Starting Retraining...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Trigger Model Retraining
            </>
          )}
        </button>

        <p className="text-xs text-muted-foreground sm:mt-3">
          This operation may take several minutes to complete. You can monitor progress in
          the training history section below.
        </p>
      </div>
    </motion.div>
  );
}
