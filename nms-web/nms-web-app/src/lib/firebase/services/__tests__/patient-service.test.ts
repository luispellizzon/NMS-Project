// src/lib/firebase/services/__tests__/patient-service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  addPatient,
  getAllPatients,
  getPatientRiskAssessment,
  getPatientById,
  getPatientGameScores,
} from '../patient-service';
import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';

// Mock firebase/firestore
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(() => ({})),
  addDoc: vi.fn(),
  doc: vi.fn(() => ({})),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(() => ({})),
  where: vi.fn(() => ({})),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
}));


describe('patient-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addPatient', () => {
    it('should add a new patient and return the document ID', async () => {
      const mockPatientData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        dateOfBirth: '1990-01-01',
        role: 'patient' as const,
      };

      const mockDocId = 'patient-123';
      vi.mocked(addDoc).mockResolvedValue({ id: mockDocId } as any);
      vi.mocked(setDoc).mockResolvedValue(undefined as any);

      const result = await addPatient(mockPatientData);

      expect(collection).toHaveBeenCalledWith({}, 'users');
      expect(addDoc).toHaveBeenCalledWith(expect.anything(), {
        ...mockPatientData,
        createdAt: 'mock-timestamp',
      });
      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        { uid: mockDocId },
        { merge: true }
      );
      expect(result).toBe(mockDocId);
    });

    it('should throw an error if addDoc fails', async () => {
      const mockPatientData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        dateOfBirth: '1990-01-01',
        role: 'patient' as const,
      };

      vi.mocked(addDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(addPatient(mockPatientData)).rejects.toThrow('Could not add patient.');
    });

    it('should throw an error if setDoc fails', async () => {
      const mockPatientData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        dateOfBirth: '1990-01-01',
        role: 'patient' as const,
      };

      vi.mocked(addDoc).mockResolvedValue({ id: 'patient-123' } as any);
      vi.mocked(setDoc).mockRejectedValue(new Error('SetDoc error'));

      await expect(addPatient(mockPatientData)).rejects.toThrow('Could not add patient.');
    });
  });

  describe('getAllPatients', () => {
    it('should return all patients with patient role', async () => {
      const mockPatients = [
        { id: 'patient-1', data: () => ({ fullName: 'John Doe', email: 'john@example.com', role: 'patient' }) },
        { id: 'patient-2', data: () => ({ fullName: 'Jane Smith', email: 'jane@example.com', role: 'patient' }) },
      ];

      vi.mocked(getDocs).mockResolvedValue({
        docs: mockPatients,
      } as any);

      const result = await getAllPatients();

      expect(collection).toHaveBeenCalledWith({}, 'users');
      expect(where).toHaveBeenCalledWith('role', '==', 'patient');
      expect(result).toEqual([
        { id: 'patient-1', fullName: 'John Doe', email: 'john@example.com' },
        { id: 'patient-2', fullName: 'Jane Smith', email: 'jane@example.com' },
      ]);
    });

    it('should handle missing fullName and email fields', async () => {
      const mockPatients = [
        { id: 'patient-1', data: () => ({ role: 'patient' }) },
      ];

      vi.mocked(getDocs).mockResolvedValue({
        docs: mockPatients,
      } as any);

      const result = await getAllPatients();

      expect(result).toEqual([
        { id: 'patient-1', fullName: 'Unknown', email: '' },
      ]);
    });

    it('should throw an error if getDocs fails', async () => {
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      await expect(getAllPatients()).rejects.toThrow('Could not fetch patients.');
    });
  });

  describe('getPatientRiskAssessment', () => {
    it('should return risk assessment data if it exists', async () => {
      const mockAssessment = {
        id: 'assessment-1',
        data: () => ({
          riskScore: 75,
          riskLevel: 'High',
          age: 65,
          gender: 'Male',
        }),
      };

      vi.mocked(getDocs).mockResolvedValue({
        empty: false,
        docs: [mockAssessment],
      } as any);

      const result = await getPatientRiskAssessment('patient-123');

      expect(collection).toHaveBeenCalledWith({}, 'users', 'patient-123', 'risk_assessment');
      expect(result).toEqual({
        id: 'assessment-1',
        riskScore: 75,
        riskLevel: 'High',
        age: 65,
        gender: 'Male',
      });
    });

    it('should return null if no risk assessment exists', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        empty: true,
        docs: [],
      } as any);

      const result = await getPatientRiskAssessment('patient-123');

      expect(result).toBeNull();
    });

    it('should return null if an error occurs', async () => {
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      const result = await getPatientRiskAssessment('patient-123');

      expect(result).toBeNull();
    });
  });

  describe('getPatientById', () => {
    it('should return patient data if document exists', async () => {
      const mockPatientData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        dateOfBirth: '1990-01-01',
        role: 'patient',
        location: 'New York',
        createdAt: { toDate: () => new Date('2024-01-01') },
        riskScore: 75,
        riskLevel: 'High',
        trend: 'increasing',
        mmseScore: 25,
        currentTask: 'cognitive-assessment',
        hasCompletedCognitiveAssessment: true,
        hasCompletedImageDescription: false,
        hasCompletedMemoryAssessment: true,
        hasCompletedRiskAssessment: true,
        hasCompletedSpeechAssessment: false,
        dementiaRisk: 0.75,
        dataUsageConsent: true,
        dataUsageConsentDate: '2024-01-01',
      };

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: 'patient-123',
        data: () => mockPatientData,
      } as any);

      const result = await getPatientById('patient-123');

      expect(doc).toHaveBeenCalledWith({}, 'users', 'patient-123');
      expect(result).toMatchObject({
        uid: 'patient-123',
        id: 'patient-123',
        fullName: 'John Doe',
        email: 'john@example.com',
        dateOfBirth: '1990-01-01',
        role: 'patient',
        location: 'New York',
        riskScore: 75,
        riskLevel: 'High',
        trend: 'increasing',
        mmseScore: 25,
        currentTask: 'cognitive-assessment',
        hasCompletedCognitiveAssessment: true,
        hasCompletedImageDescription: false,
        hasCompletedMemoryAssessment: true,
        hasCompletedRiskAssessment: true,
        hasCompletedSpeechAssessment: false,
        dementiaModelPrediction: 0.75,
        dataUsageConsent: true,
        dataUsageConsentDate: '2024-01-01',
      });
    });

    it('should handle missing optional fields with defaults', async () => {
      const mockPatientData = {
        role: 'patient',
      };

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: 'patient-123',
        data: () => mockPatientData,
      } as any);

      const result = await getPatientById('patient-123');

      expect(result).toMatchObject({
        uid: 'patient-123',
        id: 'patient-123',
        fullName: 'Unknown',
        email: '',
        dateOfBirth: '',
        role: 'patient',
      });
      expect(result?.createdAt).toBeInstanceOf(Date);
    });

    it('should return null if patient does not exist', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any);

      const result = await getPatientById('patient-123');

      expect(result).toBeNull();
    });

    it('should return null if an error occurs', async () => {
      vi.mocked(getDoc).mockRejectedValue(new Error('Firestore error'));

      const result = await getPatientById('patient-123');

      expect(result).toBeNull();
    });
  });

  describe('getPatientGameScores', () => {
    it('should return game scores if they exist', async () => {
      const mockScores = {
        cognitiveScore: 85,
        memoryScore: 90,
        speechScore: 88,
      };

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: 'patient-123',
        data: () => mockScores,
      } as any);

      const result = await getPatientGameScores('patient-123');

      expect(doc).toHaveBeenCalledWith({}, 'game_scores', 'patient-123');
      expect(result).toEqual({
        id: 'patient-123',
        ...mockScores,
      });
    });

    it('should return null if game scores do not exist', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any);

      const result = await getPatientGameScores('patient-123');

      expect(result).toBeNull();
    });

    it('should return null if an error occurs', async () => {
      vi.mocked(getDoc).mockRejectedValue(new Error('Firestore error'));

      const result = await getPatientGameScores('patient-123');

      expect(result).toBeNull();
    });
  });
});