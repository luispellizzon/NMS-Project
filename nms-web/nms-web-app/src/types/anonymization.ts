// src/types/anonymization.ts
import { Timestamp } from 'firebase/firestore';

/**
 * Anonymized Patient Data Structure
 * This matches the format expected by the Hugging Face model
 */
export interface AnonymizedPatientData {
  anonymousId: string; // UUID
  Age: number;
  Weight: number;
  Dominant_Hand: 'Right' | 'Left' | 'Ambidextrous';
  Gender: 'Male' | 'Female';
  Education_Level: 'No School' | 'Primary' | 'Secondary' | 'Tertiary';
  Smoking_Status: string;
  Alcohol_Use: 'Non-Drinker' | 'Occasional' | 'Regular';
  Physical_Activity: string;
  Nutrition_Diet: string;
  Sleep_Quality: 'Poor' | 'Average' | 'Good';
  Diabetic: '0' | '1';
  Family_History: 'Yes' | 'No';
  Depression_Status: 'Yes' | 'No';
  APOE_ε4: 'Positive' | 'Negative';
  Medication_History: 'Yes' | 'No';
  Chronic_Health_Conditions: string;
  Cognitive_Test_Scores: number; // 0-10 (inverted MMSE)

  // Metadata
  anonymizedAt: Timestamp | Date;
  sourcePatientId: string; // Encrypted original UID
  usedInTraining: boolean;
  trainedAt?: Timestamp | Date;
  dataVersion: string; // For schema migrations
}

/**
 * Patient summary for selection table
 */
export interface EligiblePatient {
  id: string;
  maskedId: string; // e.g., "PAT-1234"
  fullName: string; // For display purposes only (not anonymized yet)
  assessmentDate: string;
  mmseScore: number;
  riskLevel: 'High' | 'Moderate' | 'Low';
  consentGiven: boolean;
  alreadyAnonymized: boolean;
}

/**
 * Batch anonymization result
 */
export interface BatchAnonymizationResult {
  success: boolean;
  totalRequested: number;
  successfullyAnonymized: number;
  failed: number;
  errors: Array<{
    patientId: string;
    error: string;
  }>;
  anonymizedIds: string[];
}

/**
 * Dataset statistics for overview
 */
export interface DatasetStats {
  totalRecords: number;
  lastAnonymized: string | null;
  newRecordsSinceLastTraining: number;
  distribution: {
    ageGroups: {
      '40-50': number;
      '51-60': number;
      '61-70': number;
      '71+': number;
    };
    gender: {
      Male: number;
      Female: number;
    };
    riskLevels: {
      Low: number;
      Moderate: number;
      High: number;
    };
  };
}

/**
 * Retraining log entry
 */
export interface RetrainingLog {
  id: string;
  triggeredBy: string; // Doctor UID
  triggeredByName?: string; // Doctor name for display
  triggeredAt: Timestamp | Date;
  status: 'started' | 'in_progress' | 'completed' | 'failed';
  datasetSize: {
    baseRecords: number;
    newRecords: number;
    totalRecords: number;
  };
  modelVersion?: string;
  trainingMetrics?: {
    loss: number;
    mae: number;
    epochs: number;
  };
  error?: string;
  completedAt?: Timestamp | Date;
  duration?: number; // seconds
}

/**
 * Retraining response from API
 */
export interface RetrainingResponse {
  success: boolean;
  trainingId?: string;
  message: string;
  estimatedDuration?: string;
  error?: string;
}

/**
 * Anonymization preview (before/after comparison)
 */
export interface AnonymizationPreview {
  original: {
    id: string;
    name: string;
    age: number;
    riskLevel: string;
  };
  anonymized: Partial<AnonymizedPatientData>;
}