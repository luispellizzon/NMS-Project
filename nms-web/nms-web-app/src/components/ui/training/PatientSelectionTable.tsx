'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { EligiblePatient } from '@/types/anonymization';

interface PatientSelectionTableProps {
  doctorId: string;
  onSelectionChange: (selectedIds: string[]) => void;
  onAnonymize: (patientIds: string[]) => void;
}

export default function PatientSelectionTable({
  doctorId,
  onSelectionChange,
  onAnonymize,
}: PatientSelectionTableProps) {
  const [patients, setPatients] = useState<EligiblePatient[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchEligiblePatients();
  }, [doctorId]);

  useEffect(() => {
    onSelectionChange(Array.from(selectedIds));
  }, [selectedIds, onSelectionChange]);

  const fetchEligiblePatients = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/anonymization/eligible-patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch eligible patients');
      }

      const data = await response.json();
      setPatients(data.patients);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === patients.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(patients.map((p) => p.id)));
    }
  };

  const handleSelectOne = (patientId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(patientId)) {
      newSelected.delete(patientId);
    } else {
      newSelected.add(patientId);
    }
    setSelectedIds(newSelected);
  };

  const handleAnonymize = async () => {
    if (selectedIds.size === 0) {
      alert('Please select at least one patient');
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to anonymize ${selectedIds.size} patient(s)? This action cannot be undone.`
    );

    if (!confirmed) return;

    setProcessing(true);
    try {
      await onAnonymize(Array.from(selectedIds));
      setSelectedIds(new Set());
      await fetchEligiblePatients(); // Refresh the list
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Anonymization failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="text-red-600 dark:text-red-400">
          <p className="font-semibold">Error loading patients</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={fetchEligiblePatients}
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
            Eligible Patients
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {patients.length} patient{patients.length !== 1 ? 's' : ''} available for anonymization
          </p>
        </div>
        <button
          onClick={fetchEligiblePatients}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Refresh
        </button>
      </div>

      {patients.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No eligible patients found.</p>
          <p className="text-sm mt-2">
            Patients must meet ALL criteria to be eligible:
          </p>
          <ul className="text-sm mt-3 text-left max-w-md mx-auto space-y-1">
            <li>✓ Given consent for data usage (dataUsageConsent = true)</li>
            <li>✓ Completed Risk Assessment (hasCompletedRiskAssessment = true)</li>
            <li>✓ Completed Cognitive Assessment (has valid mmseScore)</li>
            <li>✓ Not already anonymized</li>
          </ul>
        </div>
      ) : (
        <>
          {/* Selection Actions */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {selectedIds.size === patients.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedIds.size} selected
              </span>
            </div>
            <button
              onClick={handleAnonymize}
              disabled={selectedIds.size === 0 || processing}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {processing ? 'Processing...' : `Anonymize Selected (${selectedIds.size})`}
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === patients.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                    Patient ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                    Risk Level
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                    MMSE Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {patients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(patient.id)}
                        onChange={() => handleSelectOne(patient.id)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                      {patient.fullName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {patient.maskedId}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {patient.riskLevel}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {patient.mmseScore}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {patient.consentGiven && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded">
                            Consent
                          </span>
                        )}
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                          Ready
                        </span>
                        {patient.alreadyAnonymized && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded">
                            Anonymized
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </motion.div>
  );
}