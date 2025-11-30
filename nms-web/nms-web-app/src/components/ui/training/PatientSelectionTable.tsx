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
      <div className="bg-card border border-border rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-10 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-md p-6">
        <div className="text-destructive">
          <p className="font-semibold">Error loading patients</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={fetchEligiblePatients}
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
            Eligible Patients
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {patients.length} patient{patients.length !== 1 ? 's' : ''} available for anonymization
          </p>
        </div>
        <button
          onClick={fetchEligiblePatients}
          className="text-sm text-primary hover:underline"
        >
          Refresh
        </button>
      </div>

      {patients.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
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
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
            <div className="flex items-center gap-4">
              <button
                onClick={handleSelectAll}
                className="text-sm text-primary hover:underline"
              >
                {selectedIds.size === patients.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className="text-sm text-muted-foreground">
                {selectedIds.size} selected
              </span>
            </div>
            <button
              onClick={handleAnonymize}
              disabled={selectedIds.size === 0 || processing}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {processing ? 'Processing...' : `Anonymize Selected (${selectedIds.size})`}
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === patients.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-primary rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground uppercase">
                    Patient ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground uppercase">
                    Risk Level
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground uppercase">
                    MMSE Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {patients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(patient.id)}
                        onChange={() => handleSelectOne(patient.id)}
                        className="w-4 h-4 text-primary rounded"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {patient.fullName}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {patient.maskedId}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {patient.riskLevel}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {patient.mmseScore}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {patient.consentGiven && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-300 rounded">
                            Consent
                          </span>
                        )}
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-primary/10 border border-primary/20 text-primary rounded">
                          Ready
                        </span>
                        {patient.alreadyAnonymized && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 rounded">
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