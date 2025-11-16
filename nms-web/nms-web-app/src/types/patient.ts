// src/types/patient.ts

export type RiskLevel = 'High' | 'Moderate' | 'Low';
export type Trend = 'Up' | 'Down' | 'Stable';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female';
  avatarUrl: string;
  riskScore: number;
  riskLevel: RiskLevel;
  trend: Trend;
  assessments: {
    cognitive: number;
    speech: number;
  };
  lastCheck: string; // Using string for simplicity, can be Date object
  nextAppointment: string;
}

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