// src/lib/firebase/services/__tests__/model-retraining-service.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  triggerModelRetraining,
  getRetrainingHistory,
  saveRetrainingLog,
  markRetrainingCompleted,
  markRetrainingFailed,
} from '../model-retraining-service';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

// Mock firebase/firestore
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(() => ({})),
  doc: vi.fn(() => ({})),
  setDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(() => ({})),
  orderBy: vi.fn(() => ({})),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
  Timestamp: class {
    constructor(public seconds: number, public nanoseconds: number) {}
    toMillis() {
      return this.seconds * 1000;
    }
    toDate() {
      return new Date(this.seconds * 1000);
    }
  },
}));

// Mock firebase config
vi.mock('../config', () => ({
  db: {},
}));

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-training-id-123'),
}));

// Mock doctor-service
vi.mock('../doctor-service', () => ({
  getDoctorProfile: vi.fn(),
}));

// Mock anonymization-service
vi.mock('../anonymization-service', () => ({
  getAnonymizedDataStats: vi.fn(),
}));

import { getDoctorProfile } from '../doctor-service';
import { getAnonymizedDataStats } from '../anonymization-service';

// Mock global fetch
global.fetch = vi.fn();

describe('model-retraining-service', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Set environment variables
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_HF_SPACE_URL: 'https://test-hf-space.com',
      NEXT_PUBLIC_HF_ADMIN_SECRET: 'test-secret',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe('triggerModelRetraining', () => {
    it('should successfully trigger model retraining', async () => {
      const mockDoctor = {
        id: 'doctor-123',
        fullName: 'Dr. John Doe',
        email: 'john@example.com',
      };

      const mockStats = {
        totalRecords: 100,
        newRecordsSinceLastTraining: 25,
      };

      vi.mocked(getDoctorProfile).mockResolvedValue(mockDoctor as any);
      vi.mocked(getAnonymizedDataStats).mockResolvedValue(mockStats as any);
      vi.mocked(setDoc).mockResolvedValue(undefined as any);
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'Training started' }),
      } as Response);

      const result = await triggerModelRetraining('doctor-123');

      expect(result.success).toBe(true);
      expect(result.trainingId).toBe('mock-training-id-123');
      expect(result.message).toBe('Training started');
      expect(setDoc).toHaveBeenCalledTimes(2); // Initial log + in_progress update
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/retrain?doctor_key='),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should throw error if doctor not found', async () => {
      vi.mocked(getDoctorProfile).mockResolvedValue(null);

      const result = await triggerModelRetraining('doctor-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Doctor not found');
    });

    it('should handle HF Space API errors', async () => {
      vi.mocked(getDoctorProfile).mockResolvedValue({
        id: 'doctor-123',
        fullName: 'Dr. John Doe',
      } as any);
      vi.mocked(getAnonymizedDataStats).mockResolvedValue({
        totalRecords: 100,
        newRecordsSinceLastTraining: 25,
      } as any);
      vi.mocked(setDoc).mockResolvedValue(undefined as any);
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      } as Response);

      const result = await triggerModelRetraining('doctor-123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('HF Space returned error: 500');
    });

    it('should handle network errors', async () => {
      vi.mocked(getDoctorProfile).mockResolvedValue({
        id: 'doctor-123',
        fullName: 'Dr. John Doe',
      } as any);
      vi.mocked(getAnonymizedDataStats).mockResolvedValue({
        totalRecords: 100,
        newRecordsSinceLastTraining: 25,
      } as any);
      vi.mocked(setDoc).mockResolvedValue(undefined as any);
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      const result = await triggerModelRetraining('doctor-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('getRetrainingHistory', () => {
    it('should return retraining history logs', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          data: () => ({
            triggeredBy: 'doctor-123',
            triggeredByName: 'Dr. John Doe',
            triggeredAt: new Timestamp(Date.now() / 1000, 0),
            status: 'completed',
            datasetSize: {
              baseRecords: 75,
              newRecords: 25,
              totalRecords: 100,
            },
            modelVersion: 'v1.2.0',
            trainingMetrics: {
              loss: 0.15,
              mae: 0.12,
              epochs: 50,
            },
          }),
        },
        {
          id: 'log-2',
          data: () => ({
            triggeredBy: 'doctor-456',
            triggeredByName: 'Dr. Jane Smith',
            triggeredAt: new Timestamp(Date.now() / 1000 - 86400, 0),
            status: 'failed',
            error: 'Insufficient data',
            datasetSize: {
              baseRecords: 0,
              newRecords: 0,
              totalRecords: 0,
            },
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValue({
        docs: mockLogs,
      } as any);

      const result = await getRetrainingHistory();

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'log-1',
        status: 'completed',
        triggeredByName: 'Dr. John Doe',
      });
      expect(result[1]).toMatchObject({
        id: 'log-2',
        status: 'failed',
        error: 'Insufficient data',
      });
    });

    it('should handle empty history', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        docs: [],
      } as any);

      const result = await getRetrainingHistory();

      expect(result).toEqual([]);
    });

    it('should handle missing datasetSize field', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          data: () => ({
            triggeredBy: 'doctor-123',
            triggeredByName: 'Dr. John Doe',
            triggeredAt: new Timestamp(Date.now() / 1000, 0),
            status: 'in_progress',
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValue({
        docs: mockLogs,
      } as any);

      const result = await getRetrainingHistory();

      expect(result[0].datasetSize).toEqual({
        baseRecords: 0,
        newRecords: 0,
        totalRecords: 0,
      });
    });

    it('should throw error on failure', async () => {
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      await expect(getRetrainingHistory()).rejects.toThrow(
        'Failed to fetch retraining history'
      );
    });
  });

  describe('saveRetrainingLog', () => {
    it('should save retraining log updates', async () => {
      const updates = {
        status: 'in_progress' as const,
        modelVersion: 'v1.3.0',
      };

      vi.mocked(setDoc).mockResolvedValue(undefined as any);

      await saveRetrainingLog('training-123', updates);

      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'in_progress',
          modelVersion: 'v1.3.0',
          lastUpdated: 'mock-timestamp',
        }),
        { merge: true }
      );
    });

    it('should throw error on failure', async () => {
      vi.mocked(setDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(saveRetrainingLog('training-123', {})).rejects.toThrow(
        'Failed to save retraining log'
      );
    });
  });

  describe('markRetrainingCompleted', () => {
    it('should mark retraining as completed with metrics', async () => {
      const mockTimestamp = new Timestamp(Date.now() / 1000 - 120, 0);
      const mockLogs = [
        {
          id: 'training-123',
          data: () => ({
            triggeredAt: mockTimestamp,
            status: 'in_progress',
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValue({
        empty: false,
        docs: mockLogs,
      } as any);
      vi.mocked(setDoc).mockResolvedValue(undefined as any);

      const metrics = {
        loss: 0.15,
        mae: 0.12,
        epochs: 50,
      };

      await markRetrainingCompleted('training-123', metrics);

      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'completed',
          completedAt: 'mock-timestamp',
          trainingMetrics: metrics,
        }),
        { merge: true }
      );
    });

    it('should mark retraining as completed without metrics', async () => {
      const mockTimestamp = new Timestamp(Date.now() / 1000 - 120, 0);
      const mockLogs = [
        {
          id: 'training-123',
          data: () => ({
            triggeredAt: mockTimestamp,
            status: 'in_progress',
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValue({
        empty: false,
        docs: mockLogs,
      } as any);
      vi.mocked(setDoc).mockResolvedValue(undefined as any);

      await markRetrainingCompleted('training-123');

      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'completed',
          completedAt: 'mock-timestamp',
        }),
        { merge: true }
      );
    });

    it('should throw error on failure', async () => {
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      await expect(markRetrainingCompleted('training-123')).rejects.toThrow();
    });
  });

  describe('markRetrainingFailed', () => {
    it('should mark retraining as failed with error message', async () => {
      vi.mocked(setDoc).mockResolvedValue(undefined as any);

      await markRetrainingFailed('training-123', 'Insufficient data');

      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'failed',
          error: 'Insufficient data',
          completedAt: 'mock-timestamp',
        }),
        { merge: true }
      );
    });

    it('should throw error on failure', async () => {
      vi.mocked(setDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(markRetrainingFailed('training-123', 'Error')).rejects.toThrow();
    });
  });
});
