// src/types/admin.ts

import { Timestamp } from 'firebase/firestore';

/**
 * User roles supported by the NMS application
 */
export type UserRole = 'patient' | 'doctor' | 'admin';

/**
 * Admin user profile
 */
export interface Admin {
  id: string; // Firebase Auth UID
  fullName: string;
  email: string;
  role: 'admin';
  createdAt: Date;
  lastLogin?: Date;
  isActive?: boolean;
}

/**
 * Data for creating a new admin
 */
export interface NewAdminData {
  fullName: string;
  email: string;
  password: string;
}

/**
 * Doctor with statistics for admin view
 */
export interface DoctorWithStats {
  id: string;
  fullName: string;
  email: string;
  role: 'doctor';
  createdAt: Date;
  patientCount: number;
  lastLogin?: Date;
  isActive?: boolean;
  specialty?: string;
  hospital?: string;
}

/**
 * Feedback/rating submitted from mobile app
 */
export interface Feedback {
  id: string;
  userId: string;
  rating: number; // 1-5 stars
  review: string;
  version: string; // App version
  timestamp: Timestamp | Date;
  // Joined data (optional, populated when fetching)
  patientName?: string;
  patientEmail?: string;
}

/**
 * Statistics about feedback
 */
export interface FeedbackStats {
  total: number;
  averageRating: number;
  distribution: Record<number, number>; // Rating -> count
}

/**
 * Support request status
 */
export type SupportRequestStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

/**
 * Support request priority
 */
export type SupportRequestPriority = 'low' | 'medium' | 'high';

/**
 * Support request from mobile app
 */
export interface SupportRequest {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: SupportRequestStatus;
  priority: SupportRequestPriority;
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
  resolvedAt?: Timestamp | Date;
  resolvedBy?: string;
  // Joined data (optional, populated when fetching)
  patientName?: string;
  patientEmail?: string;
}

/**
 * Statistics about support requests
 */
export interface SupportStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

/**
 * Options for data export
 */
export interface DataExportOptions {
  doctorIds?: string[]; // If empty/undefined, export all
  includePatients: boolean;
  includeRiskAssessments: boolean;
  format: 'csv' | 'json';
  dateRange?: {
    from: Date;
    to: Date;
  };
}

/**
 * Result of a data export operation
 */
export interface DataExportResult {
  success: boolean;
  totalDoctors: number;
  totalPatients: number;
  totalAssessments: number;
  data: ExportedDataRecord[];
  error?: string;
}

/**
 * A single record in the exported data
 */
export interface ExportedDataRecord {
  doctorId: string;
  doctorName: string;
  doctorEmail: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientAge?: number;
  patientGender?: string;
  riskScore?: number;
  riskLevel?: string;
  mmseScore?: number;
  assessmentDate?: string;
}

/**
 * Admin dashboard statistics
 */
export interface AdminDashboardStats {
  totalDoctors: number;
  totalPatients: number;
  totalAdmins: number;
  totalAssessments: number;
  averageRating: number;
  feedbackCount: number;
  openSupportRequests: number;
  newPatientsThisMonth: number;
}
