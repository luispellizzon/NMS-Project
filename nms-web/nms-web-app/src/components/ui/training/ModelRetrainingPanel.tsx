'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

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
      className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg shadow-md p-6 border border-purple-200 dark:border-purple-800"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
            Model Retraining
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Trigger the AI model to retrain on all anonymized patient data. This process will
            update the model&apos;s predictions based on the latest dataset.
          </p>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              What happens during retraining:
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>All anonymized patient data is sent to the Hugging Face Space</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>The model is retrained with the combined dataset (base + new records)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>Training metrics are logged and tracked</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>The updated model is automatically deployed</span>
              </li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-800 dark:text-red-300">
                <span className="font-semibold">Error:</span> {error}
              </p>
            </div>
          )}

          {lastTrainingId && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-green-800 dark:text-green-300">
                <span className="font-semibold">Last Training ID:</span> {lastTrainingId}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Check the training history below for status updates
              </p>
            </div>
          )}

          <button
            onClick={handleTriggerRetraining}
            disabled={isRetraining}
            className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isRetraining ? (
              <span className="flex items-center gap-2 justify-center">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Starting Retraining...
              </span>
            ) : (
              'Trigger Model Retraining'
            )}
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Note: This operation may take several minutes to complete. You can monitor progress in
            the training history section below.
          </p>
        </div>

        <div className="ml-4 hidden md:block">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
}