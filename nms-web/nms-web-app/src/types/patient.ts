// src/types/patient.ts

import { Timestamp } from 'firebase/firestore';

export type RiskLevel = 'High' | 'Moderate' | 'Low';
export type Trend = 'Up' | 'Down' | 'Stable';
export type Gender = 'Male' | 'Female' | 'Other';

/**
 * AI Model Output: Lifestyle + MMSE Dementia Risk Estimator
 * Stores the raw results from the Hugging Face model
 */
export interface DementiaModelPrediction {
  // "Lifestyle Severity (0–1)"
  lifestyleSeverity: number; 
  
  // "MMSE → Severity (0–1)"
  mmseSeverity: number;
  
  // "Fused Severity (0–1)"
  fusedSeverity: number;
  
  // "Estimated Fused MMSE (0–30)"
  estimatedFusedMMSE: number;
  
  // "Dementia Risk"
  dementiaRiskLabel: string;
  
  // Timestamp when this specific prediction was generated
  generatedAt: Timestamp | Date | string;
}

/**
 * Main User Document Structure (from users collection)
 */
export interface UserDocument {
  uid: string;
  fullName: string;
  email: string;
  location?: string;
  role: 'patient' | 'doctor';
  dateOfBirth: string;
  createdAt: Timestamp | Date;
  
  // The primary score used for UI badges/sorting (e.g., 0-100)
  riskScore?: number;
  // The categorical risk level
  riskLevel?: RiskLevel;
  // Optional: Direction of risk change compared to previous assessment
  trend?: Trend;

  // --- Calculated Clinical Metrics ---
  // The final calculated MMSE Score (0-30) derived from all app assessments.
  // This is the numeric INPUT used for the Lifestyle AI Model.
  mmseScore?: number;

  // --- Task Completion Status ---
  currentTask?: string;
  hasCompletedCognitiveAssessment?: boolean;
  hasCompletedImageDescription?: boolean;
  hasCompletedMemoryAssessment?: boolean;
  hasCompletedRiskAssessment?: boolean;
  hasCompletedSpeechAssessment?: boolean;

  // --- Detailed AI Results ---
  // Stores the specific output from the Lifestyle + MMSE model
  dementiaModelPrediction?: DementiaModelPrediction;

  // --- Data Usage Consent ---
  // Consent for anonymized data usage in model training
  dataUsageConsent?: boolean;
  dataUsageConsentDate?: Timestamp | Date;
}

/**
 * Cognitive Assessment Test Structure
 */
export interface CognitiveTest {
  id: string;
  userId: string;
  taskType: string;
  timestamp: Timestamp | Date | string;
  passed: boolean;
  score: number;
  duration: number;
  imageUrl?: string;
  boundingBoxArea?: number;
  strokeCount?: number;
  totalLength?: number;
  touchSequence?: string[];
}

/**
 * Cognitive Assessment Structure (subcollection: cognitive_assessments)
 */
export interface CognitiveAssessment {
  FinalScore: number;
  State: string;
  id: string;
  time: Timestamp | Date | string;
  tasks: { // updated from tests
    [taskId: string]: CognitiveTest;
  };
}

/**
 * Speech Task Structure
 */
export interface SpeechTaskContent {
  taskId: string;
  taskName: string;
  question: string;
  maxScore: number;
  result: {
    audioUrl?: string;
    completedAt?: string;
    duration?: number;
    transcription?: string;
    userScore?: number;
  } | string | null;
  expectedAnswers: string[];
}

/**
 * Speech Assessment Structure (subcollection: speech_assessment)
 */
export interface SpeechAssessmentDocument {
  id: string;
  userId: string;
  startedAt: Timestamp | Date | string;
  completedAt: Timestamp | Date | string | null;
  isCompleted: boolean;
  totalScore: number;
  currentTaskId: string;
  aiAnalysis: string | null;
  content: {
    [taskName: string]: SpeechTaskContent;
  };
}

/**
 * Image Description Assessment Structure (subcollection: image_description_assessment)
 */
export interface ImageDescriptionAssessment {
  id: string;
  userId: string;
  testType: string;
  status: string;
  timestamp: Timestamp | Date | string;
  duration: number;
  audioUrl: string;
  transcription: string;
  aiAnalysis: string;
  score: number | null;
}

/**
 * Memory Test Structure (subcollection: memory_tests)
 */
export interface MemoryTestDocument {
  id: string;
  userId: string;
  testType: string;
  status: string;
  timestamp: Timestamp | Date | string;
  score: number;
  totalQuestions: number;
  completionTime: number;
}

/**
 * Risk Assessment Structure (subcollection: risk_assessment)
 * These are the INPUTS for the model
 */
export interface RiskAssessmentDocument {
  age: number;
  weight: number;
  gender: Gender;
  alcohol_use: string;
  smoking_status: string;
  physical_activity: string;
  nutrition_diet: string;
  sleep_quality: string;
  chronic_health_conditions: string;
  medication_history: string;
  family_history: string;
  genetic: string;
  depression_status: string;
  diabetic: string;
  dominant_hand: string;
  education_level: string;
}

/**
 * Complete Patient Data (aggregated from users collection and subcollections)
 */
export interface PatientData extends UserDocument {
  id: string;
  cognitive_assessments?: {
    [assessmentId: string]: CognitiveAssessment;
  };
  speech_assessment?: {
    [assessmentId: string]: SpeechAssessmentDocument;
  };
  image_description_assessment?: {
    [assessmentId: string]: ImageDescriptionAssessment;
  };
  memory_tests?: {
    [assessmentId: string]: MemoryTestDocument;
  };
  risk_assessment?: {
    [assessmentId: string]: RiskAssessmentDocument;
  };
}

/**
 * Legacy Patient Interface (for backward compatibility with UI components)
 */
export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  avatarUrl: string;
  riskScore: number;
  riskLevel: RiskLevel;
  trend: Trend;
  assessments: {
    cognitive: number;
    speech: number;
  };
  lastCheck: string;
  nextAppointment: string;
}

/**
 * Clinical Assessment (stored in doctors subcollection)
 */
export interface ClinicalAssessment {
  id?: string; // Document ID
  patientId: string;
  doctorId: string;
  riskLevel: RiskLevel;
  notes?: string;
  timestamp: Date;
  lastUpdated?: Date;
}

export interface ClinicalAssessmentData {
  patientId: string;
  doctorId: string;
  riskLevel: RiskLevel;
  notes?: string;
}