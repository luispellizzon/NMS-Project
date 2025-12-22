// src/lib/firebase/services/__tests__/assessment-service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getPatientSpeechAssessments,
  getPatientMemoryTests,
  getPatientCognitiveAssessments,
  getPatientImageDescriptionAssessments,
  getPatientTestHistory,
  saveClinicalAssessment,
  getClinicalAssessment,
} from '../assessment-service';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
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
  orderBy: vi.fn(() => ({})),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
}));

// Mock firebase config
vi.mock('../config', () => ({
  db: {},
}));

// Mock helpers
vi.mock('../helpers', () => ({
  convertToDateString: vi.fn((val) => {
    if (val && typeof val.toDate === 'function') {
      return val.toDate().toISOString();
    }
    return val || new Date().toISOString();
  }),
  formatDate: vi.fn((val) => '2024-01-15'),
  formatDuration: vi.fn((seconds) => `${seconds}s`),
}));

describe('assessment-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPatientSpeechAssessments', () => {
    it('should return speech assessments for a patient', async () => {
      const mockAssessments = [
        {
          id: 'speech-1',
          data: () => ({
            userId: 'patient-123',
            aiAnalysis: { score: 85 },
            completedAt: { toDate: () => new Date() },
            startedAt: { toDate: () => new Date() },
            isCompleted: true,
            totalScore: 85,
            currentTaskId: 'task-1',
            content: {},
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValue({
        docs: mockAssessments,
      } as any);

      const result = await getPatientSpeechAssessments('patient-123');

      expect(collection).toHaveBeenCalledWith({}, 'users', 'patient-123', 'speech_assessment');
      expect(orderBy).toHaveBeenCalledWith('completedAt', 'desc');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'speech-1',
        userId: 'patient-123',
        totalScore: 85,
      });
    });

    it('should return empty array on error', async () => {
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      const result = await getPatientSpeechAssessments('patient-123');

      expect(result).toEqual([]);
    });
  });

  describe('getPatientMemoryTests', () => {
    it('should return memory tests for a patient', async () => {
      const mockTests = [
        {
          id: 'memory-1',
          data: () => ({
            userId: 'patient-123',
            completionTime: 120,
            score: 8,
            status: 'completed',
            testType: 'memory_mcq',
            timestamp: { toDate: () => new Date() },
            totalQuestions: 10,
            totalScore: 10,
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValue({
        docs: mockTests,
      } as any);

      const result = await getPatientMemoryTests('patient-123');

      expect(collection).toHaveBeenCalledWith({}, 'users', 'patient-123', 'memory_tests');
      expect(orderBy).toHaveBeenCalledWith('timestamp', 'desc');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'memory-1',
        score: 8,
        totalQuestions: 10,
      });
    });

    it('should return empty array on error', async () => {
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      const result = await getPatientMemoryTests('patient-123');

      expect(result).toEqual([]);
    });
  });

  describe('getPatientCognitiveAssessments', () => {
    it('should return cognitive assessments ordered by completedAt', async () => {
      const mockAssessments = [
        {
          id: 'cognitive-1',
          data: () => ({
            FinalScore: 28,
            State: 'completed',
            time: { toDate: () => new Date() },
            tests: {},
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValue({
        docs: mockAssessments,
      } as any);

      const result = await getPatientCognitiveAssessments('patient-123');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'cognitive-1',
        FinalScore: 28,
        State: 'completed',
      });
    });

    it('should fallback to ordering by date if completedAt fails', async () => {
      const mockAssessments = [
        {
          id: 'cognitive-1',
          data: () => ({
            FinalScore: 28,
            state: 'completed',
            date: { toDate: () => new Date() },
          }),
        },
      ];

      // First call fails (completedAt), second succeeds (date)
      vi.mocked(getDocs)
        .mockRejectedValueOnce(new Error('Field not indexed'))
        .mockResolvedValueOnce({
          docs: mockAssessments,
        } as any);

      const result = await getPatientCognitiveAssessments('patient-123');

      expect(result).toHaveLength(1);
    });

    it('should fallback to no ordering if both completedAt and date fail', async () => {
      const mockAssessments = [
        {
          id: 'cognitive-1',
          data: () => ({
            totalScore: 28,
          }),
        },
      ];

      // Both ordered queries fail, unordered succeeds
      vi.mocked(getDocs)
        .mockRejectedValueOnce(new Error('Field not indexed'))
        .mockRejectedValueOnce(new Error('Field not indexed'))
        .mockResolvedValueOnce({
          docs: mockAssessments,
        } as any);

      const result = await getPatientCognitiveAssessments('patient-123');

      expect(result).toHaveLength(1);
      expect(result[0].FinalScore).toBe(28);
    });

    it('should handle both old and new field names', async () => {
      const mockAssessments = [
        {
          id: 'cognitive-1',
          data: () => ({
            totalScore: 25,
            state: 'complete',
            startedAt: { toDate: () => new Date() },
            tasks: { task1: {} },
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValue({
        docs: mockAssessments,
      } as any);

      const result = await getPatientCognitiveAssessments('patient-123');

      expect(result[0]).toMatchObject({
        FinalScore: 25,
        State: 'complete',
        tests: { task1: {} },
      });
    });

    it('should return empty array on error', async () => {
      vi.mocked(getDocs).mockRejectedValue(new Error('Fatal error'));

      const result = await getPatientCognitiveAssessments('patient-123');

      expect(result).toEqual([]);
    });
  });

  describe('getPatientImageDescriptionAssessments', () => {
    it('should return image description assessments', async () => {
      const mockAssessments = [
        {
          id: 'image-1',
          data: () => ({
            userId: 'patient-123',
            testType: 'image_description',
            status: 'completed',
            timestamp: { toDate: () => new Date() },
            duration: 180,
            audioUrl: 'https://example.com/audio.mp3',
            transcription: 'Test transcription',
            aiAnalysis: { coherence: 0.8 },
            score: 85,
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValue({
        docs: mockAssessments,
      } as any);

      const result = await getPatientImageDescriptionAssessments('patient-123');

      expect(collection).toHaveBeenCalledWith({}, 'users', 'patient-123', 'image_description_assessment');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'image-1',
        score: 85,
        transcription: 'Test transcription',
      });
    });

    it('should return empty array on error', async () => {
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      const result = await getPatientImageDescriptionAssessments('patient-123');

      expect(result).toEqual([]);
    });
  });

  describe('getPatientTestHistory', () => {
    it('should combine all test types into unified history', async () => {
      const mockSpeech = [
        {
          id: 'speech-1',
          data: () => ({
            isCompleted: true,
            totalScore: 8,
            completedAt: { toDate: () => new Date('2024-01-15') },
            content: {
              task1: { result: { duration: 5000 }, maxScore: 10 },
            },
          }),
        },
      ];

      const mockMemory = [
        {
          id: 'memory-1',
          data: () => ({
            status: 'completed',
            score: 9,
            totalQuestions: 10,
            completionTime: 120,
            timestamp: { toDate: () => new Date('2024-01-14') },
            testType: 'memory_mcq',
          }),
        },
      ];

      const mockCognitive = [
        {
          id: 'cognitive-1',
          data: () => ({
            FinalScore: 28,
            State: 'completed',
            time: { toDate: () => new Date('2024-01-13') },
            tests: { test1: { duration: 60 } },
          }),
        },
      ];

      const mockImage = [
        {
          id: 'image-1',
          data: () => ({
            status: 'completed',
            score: 85,
            duration: 180,
            timestamp: { toDate: () => new Date('2024-01-12') },
          }),
        },
      ];

      vi.mocked(getDocs)
        .mockResolvedValueOnce({ docs: mockSpeech } as any)
        .mockResolvedValueOnce({ docs: mockMemory } as any)
        .mockResolvedValueOnce({ docs: mockCognitive } as any)
        .mockResolvedValueOnce({ docs: mockImage } as any);

      const result = await getPatientTestHistory('patient-123');

      expect(result).toHaveLength(4);
      expect(result.some(item => item.testType === 'speech')).toBe(true);
      expect(result.some(item => item.testType === 'memory')).toBe(true);
      expect(result.some(item => item.testType === 'cognitive')).toBe(true);
      expect(result.some(item => item.testType === 'image_description')).toBe(true);
    });

    it('should filter out incomplete tests', async () => {
      const mockSpeech = [
        {
          id: 'speech-1',
          data: () => ({
            isCompleted: false, // Not completed
            totalScore: 0,
            content: {},
          }),
        },
      ];

      const mockMemory = [
        {
          id: 'memory-1',
          data: () => ({
            status: 'in_progress', // Not completed
            score: 0,
          }),
        },
      ];

      vi.mocked(getDocs)
        .mockResolvedValueOnce({ docs: mockSpeech } as any)
        .mockResolvedValueOnce({ docs: mockMemory } as any)
        .mockResolvedValueOnce({ docs: [] } as any)
        .mockResolvedValueOnce({ docs: [] } as any);

      const result = await getPatientTestHistory('patient-123');

      expect(result).toHaveLength(0);
    });

    it('should return empty array on error', async () => {
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      const result = await getPatientTestHistory('patient-123');

      expect(result).toEqual([]);
    });
  });

  describe('saveClinicalAssessment', () => {
    it('should create a new clinical assessment', async () => {
      const assessmentData = {
        patientId: 'patient-123',
        doctorId: 'doctor-456',
        riskLevel: 'High' as const,
        notes: 'Patient shows signs of cognitive decline',
      };

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any);
      vi.mocked(setDoc).mockResolvedValue(undefined as any);

      const result = await saveClinicalAssessment(assessmentData);

      expect(doc).toHaveBeenCalledWith(
        {},
        'doctors',
        'doctor-456',
        'clinical_assessments',
        'patient-123'
      );
      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          patientId: 'patient-123',
          riskLevel: 'High',
          notes: 'Patient shows signs of cognitive decline',
          timestamp: 'mock-timestamp',
          lastUpdated: 'mock-timestamp',
        })
      );
      expect(result).toBe('patient-123');
    });

    it('should update an existing clinical assessment', async () => {
      const assessmentData = {
        patientId: 'patient-123',
        doctorId: 'doctor-456',
        riskLevel: 'Moderate' as const,
        notes: 'Condition stable',
      };

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
      } as any);
      vi.mocked(setDoc).mockResolvedValue(undefined as any);

      const result = await saveClinicalAssessment(assessmentData);

      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          patientId: 'patient-123',
          riskLevel: 'Moderate',
          notes: 'Condition stable',
          lastUpdated: 'mock-timestamp',
        }),
        { merge: true }
      );
      expect(result).toBe('patient-123');
    });

    it('should handle null notes', async () => {
      const assessmentData = {
        patientId: 'patient-123',
        doctorId: 'doctor-456',
        riskLevel: 'Low' as const,
        notes: '',
      };

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any);
      vi.mocked(setDoc).mockResolvedValue(undefined as any);

      await saveClinicalAssessment(assessmentData);

      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          notes: null,
        })
      );
    });

    it('should throw an error if save fails', async () => {
      const assessmentData = {
        patientId: 'patient-123',
        doctorId: 'doctor-456',
        riskLevel: 'High' as const,
        notes: 'Test notes',
      };

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any);
      vi.mocked(setDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(saveClinicalAssessment(assessmentData)).rejects.toThrow(
        'Could not save clinical assessment.'
      );
    });
  });

  describe('getClinicalAssessment', () => {
    it('should return clinical assessment if it exists', async () => {
      const mockData = {
        patientId: 'patient-123',
        riskLevel: 'High',
        notes: 'Test notes',
        timestamp: { toDate: () => new Date('2024-01-01') },
        lastUpdated: { toDate: () => new Date('2024-01-15') },
      };

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: 'patient-123',
        data: () => mockData,
      } as any);

      const result = await getClinicalAssessment('doctor-456', 'patient-123');

      expect(doc).toHaveBeenCalledWith(
        {},
        'doctors',
        'doctor-456',
        'clinical_assessments',
        'patient-123'
      );
      expect(result).toMatchObject({
        id: 'patient-123',
        patientId: 'patient-123',
        doctorId: 'doctor-456',
        riskLevel: 'High',
        notes: 'Test notes',
      });
    });

    it('should return null if assessment does not exist', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any);

      const result = await getClinicalAssessment('doctor-456', 'patient-123');

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      vi.mocked(getDoc).mockRejectedValue(new Error('Firestore error'));

      const result = await getClinicalAssessment('doctor-456', 'patient-123');

      expect(result).toBeNull();
    });
  });
});