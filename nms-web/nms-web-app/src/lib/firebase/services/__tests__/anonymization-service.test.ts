// src/lib/firebase/services/__tests__/anonymization-service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getEligiblePatientsForAnonymization,
  anonymizePatientData,
  batchAnonymizePatients,
  getAnonymizedDataStats,
} from '../anonymization-service';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

// Mock firebase/firestore
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(() => ({})),
  doc: vi.fn(() => ({})),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(() => ({})),
  where: vi.fn(() => ({})),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
  Timestamp: class {
    constructor(public seconds: number, public nanoseconds: number) {}
    toDate() {
      return new Date(this.seconds * 1000);
    }
  },
}));

// Mock firebase config
vi.mock('../config', () => ({
  db: {},
}));

// Mock crypto
vi.mock('crypto', () => ({
  default: {
    randomBytes: vi.fn((size: number) => Buffer.alloc(size, 0)),
    createCipheriv: vi.fn(() => ({
      update: vi.fn((text: string) => Buffer.from(text)),
      final: vi.fn(() => Buffer.from('')),
    })),
  },
}));

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid-1234'),
}));

// Mock patient and doctor services
vi.mock('../patient-service', () => ({
  getPatientById: vi.fn(),
  getPatientRiskAssessment: vi.fn(),
}));

vi.mock('../doctor-service', () => ({
  getDoctorPatients: vi.fn(),
}));

import { getPatientById, getPatientRiskAssessment } from '../patient-service';
import { getDoctorPatients } from '../doctor-service';

describe('anonymization-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console logs in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('getEligiblePatientsForAnonymization', () => {
    it('should return eligible patients who have completed assessments and given consent', async () => {
      const mockPatientIds = ['patient-1', 'patient-2'];

      vi.mocked(getDoctorPatients).mockResolvedValue(mockPatientIds);
      vi.mocked(getDocs).mockResolvedValue({
        docs: [],
        size: 0,
      } as any);

      vi.mocked(getPatientById)
        .mockResolvedValueOnce({
          id: 'patient-1',
          fullName: 'John Doe',
          dateOfBirth: '1990-01-15',
          hasCompletedRiskAssessment: true,
          mmseScore: 25,
          dataUsageConsent: true,
          riskLevel: 'Moderate',
          createdAt: new Date('2024-01-01'),
        })
        .mockResolvedValueOnce({
          id: 'patient-2',
          fullName: 'Jane Smith',
          dateOfBirth: '1985-05-20',
          hasCompletedRiskAssessment: false,
          mmseScore: 28,
          dataUsageConsent: true,
          riskLevel: 'Low',
          createdAt: new Date('2024-01-02'),
        });

      vi.mocked(getPatientRiskAssessment).mockResolvedValue({
        id: 'assessment-1',
        riskScore: 75,
      });

      const result = await getEligiblePatientsForAnonymization('doctor-123');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'patient-1',
        fullName: 'John Doe',
        mmseScore: 25,
        riskLevel: 'Moderate',
        consentGiven: true,
      });
      expect(result[0].maskedId).toBe('PAT-nt-1');
    });

    it('should exclude patients without consent', async () => {
      vi.mocked(getDoctorPatients).mockResolvedValue(['patient-1']);
      vi.mocked(getDocs).mockResolvedValue({ docs: [], size: 0 } as any);

      vi.mocked(getPatientById).mockResolvedValue({
        id: 'patient-1',
        hasCompletedRiskAssessment: true,
        mmseScore: 25,
        dataUsageConsent: false, // No consent
        dateOfBirth: '1990-01-15',
        createdAt: new Date(),
      });

      const result = await getEligiblePatientsForAnonymization('doctor-123');

      expect(result).toHaveLength(0);
    });

    it('should exclude patients without completed assessments', async () => {
      vi.mocked(getDoctorPatients).mockResolvedValue(['patient-1']);
      vi.mocked(getDocs).mockResolvedValue({ docs: [], size: 0 } as any);

      vi.mocked(getPatientById).mockResolvedValue({
        id: 'patient-1',
        hasCompletedRiskAssessment: false, // Not completed
        mmseScore: undefined,
        dataUsageConsent: true,
        dateOfBirth: '1990-01-15',
        createdAt: new Date(),
      });

      const result = await getEligiblePatientsForAnonymization('doctor-123');

      expect(result).toHaveLength(0);
    });

    it('should handle patients not found', async () => {
      vi.mocked(getDoctorPatients).mockResolvedValue(['patient-1']);
      vi.mocked(getDocs).mockResolvedValue({ docs: [], size: 0 } as any);
      vi.mocked(getPatientById).mockResolvedValue(null);

      const result = await getEligiblePatientsForAnonymization('doctor-123');

      expect(result).toHaveLength(0);
    });

    it('should throw error on failure', async () => {
      vi.mocked(getDoctorPatients).mockRejectedValue(new Error('Firestore error'));

      await expect(getEligiblePatientsForAnonymization('doctor-123')).rejects.toThrow(
        'Failed to fetch eligible patients for anonymization'
      );
    });
  });

  describe('anonymizePatientData', () => {
    it('should successfully anonymize patient data', async () => {
      const mockPatient = {
        id: 'patient-123',
        fullName: 'John Doe',
        dateOfBirth: '15/02/1990',
        mmseScore: 25,
        dataUsageConsent: true,
      };

      const mockRiskAssessment = {
        weight: 70,
        dominant_hand: 'right',
        gender: 'Male',
        education_level: 'Secondary',
        smoking_status: 'Non-Smoker',
        alcohol_use: 'Occasional',
        physical_activity: 'Moderate',
        nutrition_diet: 'Balanced',
        sleep_quality: 'Good',
        diabetic: 'no',
        family_history: 'Yes',
        depression_status: 'No',
        genetic: 'Negative',
        medication_history: 'Yes',
        chronic_health_conditions: 'None',
      };

      vi.mocked(getPatientById).mockResolvedValue(mockPatient);
      vi.mocked(getDocs).mockResolvedValue({
        empty: false,
        docs: [{ data: () => mockRiskAssessment }],
      } as any);
      vi.mocked(setDoc).mockResolvedValue(undefined as any);

      const result = await anonymizePatientData('patient-123');

      expect(result).toMatchObject({
        anonymousId: 'mock-uuid-1234',
        Gender: 'Male',
        Education_Level: 'Secondary',
        Smoking_Status: 'Non-Smoker',
        usedInTraining: false,
        dataVersion: '1.0',
      });
      expect(result.Age).toBeGreaterThan(0);
      expect(setDoc).toHaveBeenCalled();
    });

    it('should throw error if patient not found', async () => {
      vi.mocked(getPatientById).mockResolvedValue(null);

      await expect(anonymizePatientData('patient-123')).rejects.toThrow(
        'Patient not found: patient-123'
      );
    });

    it('should throw error if patient has not given consent', async () => {
      vi.mocked(getPatientById).mockResolvedValue({
        id: 'patient-123',
        dataUsageConsent: false,
      });

      await expect(anonymizePatientData('patient-123')).rejects.toThrow(
        'Patient has not given consent for data usage'
      );
    });

    it('should throw error if no risk assessment found', async () => {
      vi.mocked(getPatientById).mockResolvedValue({
        id: 'patient-123',
        dataUsageConsent: true,
        mmseScore: 25,
      });
      vi.mocked(getDocs).mockResolvedValue({
        empty: true,
        docs: [],
      } as any);

      await expect(anonymizePatientData('patient-123')).rejects.toThrow(
        'No risk assessment found for patient'
      );
    });

    it('should throw error if MMSE score is missing', async () => {
      vi.mocked(getPatientById).mockResolvedValue({
        id: 'patient-123',
        dataUsageConsent: true,
        mmseScore: undefined,
      });
      vi.mocked(getDocs).mockResolvedValue({
        empty: false,
        docs: [{ data: () => ({}) }],
      } as any);

      await expect(anonymizePatientData('patient-123')).rejects.toThrow(
        'Patient does not have a valid MMSE score'
      );
    });

    it('should handle different date formats', async () => {
      const mockPatient = {
        id: 'patient-123',
        dateOfBirth: '1990-01-15', // ISO format
        mmseScore: 25,
        dataUsageConsent: true,
      };

      const mockRiskAssessment = {
        weight: 70,
        dominant_hand: 'right',
        gender: 'Male',
        education_level: 'Tertiary',
        smoking_status: 'Non-Smoker',
        alcohol_use: 'Non-Drinker',
        physical_activity: 'High',
        nutrition_diet: 'Balanced',
        sleep_quality: 'Good',
        diabetic: 'yes',
        family_history: 'No',
        depression_status: 'No',
        genetic: 'Positive',
        medication_history: 'No',
        chronic_health_conditions: 'Hypertension',
      };

      vi.mocked(getPatientById).mockResolvedValue(mockPatient);
      vi.mocked(getDocs).mockResolvedValue({
        empty: false,
        docs: [{ data: () => mockRiskAssessment }],
      } as any);
      vi.mocked(setDoc).mockResolvedValue(undefined as any);

      const result = await anonymizePatientData('patient-123');

      expect(result.Age).toBeGreaterThan(0);
      expect(result.Diabetic).toBe('1');
      expect(result.APOE_ε4).toBe('Positive');
    });
  });

  describe('batchAnonymizePatients', () => {
    it('should successfully anonymize multiple patients', async () => {
      const mockPatient = {
        id: 'patient-1',
        dateOfBirth: '1990-01-15',
        mmseScore: 25,
        dataUsageConsent: true,
      };

      const mockRiskAssessment = {
        weight: 70,
        dominant_hand: 'right',
        gender: 'Male',
        education_level: 'Secondary',
        smoking_status: 'Non-Smoker',
        alcohol_use: 'Occasional',
        physical_activity: 'Moderate',
        nutrition_diet: 'Balanced',
        sleep_quality: 'Good',
        diabetic: 'no',
        family_history: 'Yes',
        depression_status: 'No',
        genetic: 'Negative',
        medication_history: 'Yes',
        chronic_health_conditions: 'None',
      };

      vi.mocked(getPatientById).mockResolvedValue(mockPatient);
      vi.mocked(getDocs).mockResolvedValue({
        empty: false,
        docs: [{ data: () => mockRiskAssessment }],
      } as any);
      vi.mocked(setDoc).mockResolvedValue(undefined as any);

      const result = await batchAnonymizePatients(['patient-1', 'patient-2']);

      expect(result.success).toBe(true);
      expect(result.totalRequested).toBe(2);
      expect(result.successfullyAnonymized).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.anonymizedIds).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle partial failures', async () => {
      vi.mocked(getPatientById)
        .mockResolvedValueOnce({
          id: 'patient-1',
          dateOfBirth: '1990-01-15',
          mmseScore: 25,
          dataUsageConsent: true,
        })
        .mockResolvedValueOnce(null); // Second patient not found

      vi.mocked(getDocs).mockResolvedValue({
        empty: false,
        docs: [{ data: () => ({
          weight: 70,
          dominant_hand: 'right',
          gender: 'Male',
          education_level: 'Secondary',
          smoking_status: 'Non-Smoker',
          alcohol_use: 'Occasional',
          physical_activity: 'Moderate',
          nutrition_diet: 'Balanced',
          sleep_quality: 'Good',
          diabetic: 'no',
          family_history: 'Yes',
          depression_status: 'No',
          genetic: 'Negative',
          medication_history: 'Yes',
          chronic_health_conditions: 'None',
        }) }],
      } as any);
      vi.mocked(setDoc).mockResolvedValue(undefined as any);

      const result = await batchAnonymizePatients(['patient-1', 'patient-2']);

      expect(result.success).toBe(false);
      expect(result.successfullyAnonymized).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].patientId).toBe('patient-2');
    });

    it('should return all failures if all patients fail', async () => {
      vi.mocked(getPatientById).mockResolvedValue(null);

      const result = await batchAnonymizePatients(['patient-1', 'patient-2']);

      expect(result.success).toBe(false);
      expect(result.successfullyAnonymized).toBe(0);
      expect(result.failed).toBe(2);
      expect(result.errors).toHaveLength(2);
    });
  });

  describe('getAnonymizedDataStats', () => {
    it('should calculate dataset statistics correctly', async () => {
      const mockTimestamp = new Timestamp(Date.now() / 1000, 0);

      const mockDocs = [
        {
          data: () => ({
            Age: 45,
            Gender: 'Male',
            Cognitive_Test_Scores: 2, // Low risk
            anonymizedAt: mockTimestamp,
            usedInTraining: false,
          }),
        },
        {
          data: () => ({
            Age: 55,
            Gender: 'Female',
            Cognitive_Test_Scores: 5, // Moderate risk
            anonymizedAt: mockTimestamp,
            usedInTraining: true,
          }),
        },
        {
          data: () => ({
            Age: 65,
            Gender: 'Male',
            Cognitive_Test_Scores: 8, // High risk
            anonymizedAt: mockTimestamp,
            usedInTraining: false,
          }),
        },
        {
          data: () => ({
            Age: 75,
            Gender: 'Female',
            Cognitive_Test_Scores: 3,
            anonymizedAt: mockTimestamp,
            usedInTraining: false,
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValue({
        docs: mockDocs,
        size: 4,
      } as any);

      const result = await getAnonymizedDataStats();

      expect(result.totalRecords).toBe(4);
      expect(result.newRecordsSinceLastTraining).toBe(3);
      expect(result.distribution.ageGroups['40-50']).toBe(1);
      expect(result.distribution.ageGroups['51-60']).toBe(1);
      expect(result.distribution.ageGroups['61-70']).toBe(1);
      expect(result.distribution.ageGroups['71+']).toBe(1);
      expect(result.distribution.gender.Male).toBe(2);
      expect(result.distribution.gender.Female).toBe(2);
      expect(result.distribution.riskLevels.Low).toBe(1);
      expect(result.distribution.riskLevels.Moderate).toBe(2);
      expect(result.distribution.riskLevels.High).toBe(1);
      expect(result.lastAnonymized).toBeTruthy();
    });

    it('should handle empty dataset', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        docs: [],
        size: 0,
      } as any);

      const result = await getAnonymizedDataStats();

      expect(result.totalRecords).toBe(0);
      expect(result.newRecordsSinceLastTraining).toBe(0);
      expect(result.lastAnonymized).toBeNull();
    });

    it('should throw error on failure', async () => {
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      await expect(getAnonymizedDataStats()).rejects.toThrow(
        'Failed to fetch dataset statistics'
      );
    });
  });
});
