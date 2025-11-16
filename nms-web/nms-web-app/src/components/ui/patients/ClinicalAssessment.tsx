// src/components/ui/patients/ClinicalAssessment.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Edit2, Save, X } from 'lucide-react';
import { RiskLevel, ClinicalAssessment as ClinicalAssessmentType } from '@/types/patient';
import { saveClinicalAssessment, getClinicalAssessment } from '@/lib/firebase/firestore-service';
import { useAuth } from '@/contexts/AuthContext';

interface ClinicalAssessmentProps {
  patientId: string;
}

const riskLevels: RiskLevel[] = ['Low', 'Moderate', 'High'];

export default function ClinicalAssessment({ patientId }: ClinicalAssessmentProps) {
  const { user } = useAuth();
  const [assessment, setAssessment] = useState<ClinicalAssessmentType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<RiskLevel | ''>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch existing assessment on component mount
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        const existingAssessment = await getClinicalAssessment(patientId);
        if (existingAssessment) {
          setAssessment(existingAssessment);
        } else {
          // No assessment yet, enable editing mode
          setIsEditing(true);
        }
      } catch (err) {
        console.error('Error fetching clinical assessment:', err);
        setError('Failed to load assessment');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [patientId]);

  const handleEdit = () => {
    if (assessment) {
      setSelectedRiskLevel(assessment.riskLevel);
      setNotes(assessment.notes || '');
    }
    setIsEditing(true);
    setError('');
    setSuccessMessage('');
  };

  const handleCancel = () => {
    if (!assessment) {
      // If there's no existing assessment, reset the form
      setSelectedRiskLevel('');
      setNotes('');
    }
    setIsEditing(false);
    setError('');
    setSuccessMessage('');
  };

  const handleSave = async () => {
    if (!selectedRiskLevel) {
      setError('Please select a risk level');
      return;
    }

    if (!user) {
      setError('You must be logged in to save an assessment');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      await saveClinicalAssessment({
        patientId,
        doctorId: user.uid,
        riskLevel: selectedRiskLevel,
        notes: notes.trim() || undefined,
      });

      // Fetch the updated assessment
      const updatedAssessment = await getClinicalAssessment(patientId);
      setAssessment(updatedAssessment);
      setIsEditing(false);
      setSuccessMessage('Assessment saved successfully');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving clinical assessment:', err);
      setError('Failed to save assessment. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRiskLevelColor = (level: RiskLevel): string => {
    switch (level) {
      case 'Low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'High':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border rounded-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Clinical Assessment</h3>
        {assessment && !isEditing && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        )}
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {/* Display Mode */}
      {!isEditing && assessment && (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Risk Level</p>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(
                assessment.riskLevel
              )}`}
            >
              {assessment.riskLevel} Risk
            </span>
          </div>

          {assessment.notes && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Notes</p>
              <p className="text-foreground whitespace-pre-wrap">{assessment.notes}</p>
            </div>
          )}

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Last updated: {formatDate(assessment.lastUpdated || assessment.timestamp)}
            </p>
          </div>
        </div>
      )}

      {/* Editing Mode */}
      {isEditing && (
        <div className="space-y-4">
          <div>
            <label htmlFor="risk-level" className="block text-sm font-medium text-foreground mb-2">
              Risk Level <span className="text-red-500">*</span>
            </label>
            <select
              id="risk-level"
              value={selectedRiskLevel}
              onChange={(e) => setSelectedRiskLevel(e.target.value as RiskLevel)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select a risk level</option>
              {riskLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Add any additional observations or notes..."
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={!selectedRiskLevel || saving}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Assessment
                </>
              )}
            </button>

            {assessment && (
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* First time - no assessment yet */}
      {!assessment && !isEditing && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No clinical assessment available yet.</p>
          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Add Assessment
          </button>
        </div>
      )}
    </motion.div>
  );
}