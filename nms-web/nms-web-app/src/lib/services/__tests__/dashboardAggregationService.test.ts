// src/lib/services/__tests__/dashboardAggregationService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDashboardStats, getPatientSummaries } from '../dashboardAggregationService';

// Mock firestore-service
vi.mock('@/lib/firebase/firestore-service', () => ({
  getDoctorPatients: vi.fn(),
  getPatientById: vi.fn(),
  getPatientRiskAssessment: vi.fn(),
  getPatientTestHistory: vi.fn(),
  getClinicalAssessment: vi.fn(),
}));

import {
  getDoctorPatients,
  getPatientById,
  getPatientRiskAssessment,
  getPatientTestHistory,
  getClinicalAssessment,
} from '@/lib/firebase/firestore-service';

describe('dashboardAggregationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('getDashboardStats', () => {
    it('should return empty stats when doctor has no patients', async () => {
      vi.mocked(getDoctorPatients).mockResolvedValue([]);

      const stats = await getDashboardStats('doctor-123');

      expect(stats.totalPatients).toBe(0);
      expect(stats.riskDistribution).toEqual({ high: 0, moderate: 0, low: 0 });
      expect(stats.testingActivity.totalTests).toBe(0);
    });

    it('should calculate dashboard stats correctly for multiple patients', async () => {
      const mockPatientIds = ['patient-1', 'patient-2', 'patient-3'];

      vi.mocked(getDoctorPatients).mockResolvedValue(mockPatientIds);

      // Patient 1: High risk, young adult
      vi.mocked(getPatientById)
        .mockResolvedValueOnce({
          id: 'patient-1',
          fullName: 'John Doe',
          email: 'john@example.com',
          mmseScore: 15,
          hasCompletedCognitiveAssessment: true,
          hasCompletedSpeechAssessment: true,
          hasCompletedMemoryAssessment: false,
          hasCompletedRiskAssessment: true,
          hasCompletedImageDescription: false,
        } as any);

      vi.mocked(getPatientRiskAssessment).mockResolvedValueOnce({
        id: 'risk-1',
        riskLevel: 'High',
        riskScore: 85,
        age: 45,
        gender: 'Male',
      } as any);

      vi.mocked(getPatientTestHistory).mockResolvedValueOnce([
        { id: '1', testType: 'cognitive', score: '24/30', date: '2024-01-15' },
        { id: '2', testType: 'speech', score: '18/20', date: '2024-01-10' },
      ] as any);

      vi.mocked(getClinicalAssessment).mockResolvedValueOnce({
        id: 'clinical-1',
        notes: 'Patient shows improvement',
      } as any);

      // Patient 2: Moderate risk, middle-aged
      vi.mocked(getPatientById).mockResolvedValueOnce({
        id: 'patient-2',
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        mmseScore: 22,
        hasCompletedCognitiveAssessment: true,
        hasCompletedSpeechAssessment: false,
        hasCompletedMemoryAssessment: true,
        hasCompletedRiskAssessment: true,
        hasCompletedImageDescription: true,
      } as any);

      vi.mocked(getPatientRiskAssessment).mockResolvedValueOnce({
        id: 'risk-2',
        riskLevel: 'Moderate',
        riskScore: 55,
        age: 65,
        gender: 'Female',
      } as any);

      vi.mocked(getPatientTestHistory).mockResolvedValueOnce([
        { id: '3', testType: 'memory', score: '15/20', date: '2024-01-20' },
      ] as any);

      vi.mocked(getClinicalAssessment).mockResolvedValueOnce(null);

      // Patient 3: Low risk, senior
      vi.mocked(getPatientById).mockResolvedValueOnce({
        id: 'patient-3',
        fullName: 'Bob Johnson',
        email: 'bob@example.com',
        mmseScore: 28,
        hasCompletedCognitiveAssessment: false,
        hasCompletedSpeechAssessment: false,
        hasCompletedMemoryAssessment: false,
        hasCompletedRiskAssessment: false,
        hasCompletedImageDescription: false,
      } as any);

      vi.mocked(getPatientRiskAssessment).mockResolvedValueOnce({
        id: 'risk-3',
        riskLevel: 'Low',
        riskScore: 25,
        age: 75,
        gender: 'Male',
      } as any);

      vi.mocked(getPatientTestHistory).mockResolvedValueOnce([]);

      vi.mocked(getClinicalAssessment).mockResolvedValueOnce({
        id: 'clinical-3',
        notes: '',
      } as any);

      const stats = await getDashboardStats('doctor-123');

      expect(stats.totalPatients).toBe(3);
      expect(stats.riskDistribution).toEqual({
        high: 1,
        moderate: 1,
        low: 1,
      });
      expect(stats.demographicDistribution.ageGroups).toEqual({
        '0-30': 0,
        '31-50': 1,
        '51-70': 1,
        '70+': 1,
      });
      expect(stats.demographicDistribution.gender).toEqual({
        male: 2,
        female: 1,
        other: 0,
      });
      expect(stats.testingActivity.totalTests).toBe(3);
      expect(stats.clinicalAssessments.total).toBe(2);
      expect(stats.clinicalAssessments.withNotes).toBe(1);
    });

    it('should calculate completion rates correctly', async () => {
      vi.mocked(getDoctorPatients).mockResolvedValue(['patient-1', 'patient-2']);

      vi.mocked(getPatientById)
        .mockResolvedValueOnce({
          hasCompletedCognitiveAssessment: true,
          hasCompletedSpeechAssessment: true,
          hasCompletedMemoryAssessment: true,
          hasCompletedRiskAssessment: true,
          hasCompletedImageDescription: true,
          mmseScore: 25,
        } as any)
        .mockResolvedValueOnce({
          hasCompletedCognitiveAssessment: false,
          hasCompletedSpeechAssessment: false,
          hasCompletedMemoryAssessment: false,
          hasCompletedRiskAssessment: false,
          hasCompletedImageDescription: false,
          mmseScore: 20,
        } as any);

      vi.mocked(getPatientRiskAssessment).mockResolvedValue({ riskLevel: 'Low', age: 50, gender: 'Male' } as any);
      vi.mocked(getPatientTestHistory).mockResolvedValue([]);
      vi.mocked(getClinicalAssessment).mockResolvedValue(null);

      const stats = await getDashboardStats('doctor-123');

      expect(stats.completionRates.cognitiveAssessment).toBe(50);
      expect(stats.completionRates.speechAssessment).toBe(50);
      expect(stats.completionRates.memoryAssessment).toBe(50);
      expect(stats.completionRates.riskAssessment).toBe(50);
      expect(stats.completionRates.imageDescription).toBe(50);
    });

    it('should calculate average scores correctly', async () => {
      vi.mocked(getDoctorPatients).mockResolvedValue(['patient-1', 'patient-2']);

      vi.mocked(getPatientById)
        .mockResolvedValueOnce({
          mmseScore: 30, // 100%
          hasCompletedCognitiveAssessment: false,
          hasCompletedSpeechAssessment: false,
          hasCompletedMemoryAssessment: false,
          hasCompletedRiskAssessment: false,
          hasCompletedImageDescription: false,
        } as any)
        .mockResolvedValueOnce({
          mmseScore: 15, // 50%
          hasCompletedCognitiveAssessment: false,
          hasCompletedSpeechAssessment: false,
          hasCompletedMemoryAssessment: false,
          hasCompletedRiskAssessment: false,
          hasCompletedImageDescription: false,
        } as any);

      vi.mocked(getPatientRiskAssessment).mockResolvedValue({ riskLevel: 'Low', age: 50, gender: 'Male' } as any);
      vi.mocked(getPatientTestHistory).mockResolvedValue([]);
      vi.mocked(getClinicalAssessment).mockResolvedValue(null);

      const stats = await getDashboardStats('doctor-123');

      // Average of 100 and 50 is 75
      expect(stats.averageScores.overall).toBe(75);
    });

    it('should handle missing patient data gracefully', async () => {
      vi.mocked(getDoctorPatients).mockResolvedValue(['patient-1']);
      vi.mocked(getPatientById).mockResolvedValue(null);
      vi.mocked(getPatientRiskAssessment).mockResolvedValue(null);
      vi.mocked(getPatientTestHistory).mockResolvedValue([]);
      vi.mocked(getClinicalAssessment).mockResolvedValue(null);

      const stats = await getDashboardStats('doctor-123');

      expect(stats.totalPatients).toBe(1);
      expect(stats.riskDistribution).toEqual({ high: 0, moderate: 0, low: 0 });
    });

    it('should throw error on failure', async () => {
      vi.mocked(getDoctorPatients).mockRejectedValue(new Error('Firestore error'));

      await expect(getDashboardStats('doctor-123')).rejects.toThrow(
        'Could not fetch dashboard statistics.'
      );
    });
  });

  describe('getPatientSummaries', () => {
    it('should return patient summaries', async () => {
      vi.mocked(getDoctorPatients).mockResolvedValue(['patient-1', 'patient-2']);

      vi.mocked(getPatientById)
        .mockResolvedValueOnce({
          id: 'patient-1',
          fullName: 'John Doe',
          email: 'john@example.com',
        } as any)
        .mockResolvedValueOnce({
          id: 'patient-2',
          fullName: 'Jane Smith',
          email: 'jane@example.com',
        } as any);

      vi.mocked(getPatientRiskAssessment)
        .mockResolvedValueOnce({
          age: 45,
          gender: 'Male',
          riskScore: 75,
          riskLevel: 'High',
          hasCompletedCognitiveAssessment: true,
          hasCompletedSpeechAssessment: true,
          hasCompletedMemoryAssessment: false,
          hasCompletedImageDescription: false,
        } as any)
        .mockResolvedValueOnce({
          age: 55,
          gender: 'Female',
          riskScore: 45,
          riskLevel: 'Moderate',
          hasCompletedCognitiveAssessment: false,
          hasCompletedSpeechAssessment: true,
          hasCompletedMemoryAssessment: true,
          hasCompletedImageDescription: true,
        } as any);

      vi.mocked(getPatientTestHistory)
        .mockResolvedValueOnce([
          { id: '1', date: '2024-01-15', testType: 'cognitive', score: '24/30' },
          { id: '2', date: '2024-01-10', testType: 'speech', score: '18/20' },
        ] as any)
        .mockResolvedValueOnce([
          { id: '3', date: '2024-01-20', testType: 'memory', score: '15/20' },
        ] as any);

      vi.mocked(getClinicalAssessment)
        .mockResolvedValueOnce({ id: 'clinical-1', notes: 'Test notes' } as any)
        .mockResolvedValueOnce(null);

      const summaries = await getPatientSummaries('doctor-123');

      expect(summaries).toHaveLength(2);
      expect(summaries[0]).toMatchObject({
        id: 'patient-1',
        fullName: 'John Doe',
        email: 'john@example.com',
        age: 45,
        gender: 'Male',
        riskScore: 75,
        riskLevel: 'High',
        totalTests: 2,
        lastTestDate: '2024-01-15',
        hasClinicalAssessment: true,
      });
      expect(summaries[1]).toMatchObject({
        id: 'patient-2',
        fullName: 'Jane Smith',
        age: 55,
        totalTests: 1,
        lastTestDate: '2024-01-20',
        hasClinicalAssessment: false,
      });
    });

    it('should filter out null patients', async () => {
      vi.mocked(getDoctorPatients).mockResolvedValue(['patient-1', 'patient-2']);
      vi.mocked(getPatientById)
        .mockResolvedValueOnce({ id: 'patient-1', fullName: 'John Doe', email: 'john@example.com' } as any)
        .mockResolvedValueOnce(null);

      vi.mocked(getPatientRiskAssessment).mockResolvedValue({ age: 45, gender: 'Male', riskScore: 50, riskLevel: 'Moderate' } as any);
      vi.mocked(getPatientTestHistory).mockResolvedValue([]);
      vi.mocked(getClinicalAssessment).mockResolvedValue(null);

      const summaries = await getPatientSummaries('doctor-123');

      expect(summaries).toHaveLength(1);
      expect(summaries[0].id).toBe('patient-1');
    });

    it('should handle patients with no tests', async () => {
      vi.mocked(getDoctorPatients).mockResolvedValue(['patient-1']);
      vi.mocked(getPatientById).mockResolvedValue({
        id: 'patient-1',
        fullName: 'John Doe',
        email: 'john@example.com',
      } as any);
      vi.mocked(getPatientRiskAssessment).mockResolvedValue({
        age: 45,
        gender: 'Male',
        riskScore: 50,
        riskLevel: 'Moderate',
      } as any);
      vi.mocked(getPatientTestHistory).mockResolvedValue([]);
      vi.mocked(getClinicalAssessment).mockResolvedValue(null);

      const summaries = await getPatientSummaries('doctor-123');

      expect(summaries[0].totalTests).toBe(0);
      expect(summaries[0].lastTestDate).toBeNull();
    });

    it('should throw error on failure', async () => {
      vi.mocked(getDoctorPatients).mockRejectedValue(new Error('Firestore error'));

      await expect(getPatientSummaries('doctor-123')).rejects.toThrow(
        'Could not fetch patient summaries.'
      );
    });
  });
});
