// src/lib/firebase/services/__tests__/feedback-service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAllFeedback,
  getFeedbackById,
  getFeedbackStats,
  getRecentFeedback,
} from '../feedback-service';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit as firestoreLimit,
  startAfter,
} from 'firebase/firestore';

// Mock firebase/firestore
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(() => ({})),
  doc: vi.fn(() => ({})),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(() => ({})),
  orderBy: vi.fn(() => ({})),
  limit: vi.fn(() => ({})),
  startAfter: vi.fn(() => ({})),
}));

// Mock firebase config
vi.mock('../config', () => ({
  db: {},
}));

describe('feedback-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllFeedback', () => {
    it('should return all feedback entries', async () => {
      const mockFeedbackDocs = [
        {
          id: 'feedback-1',
          data: () => ({
            userId: 'user-1',
            rating: 5,
            review: 'Excellent app!',
            version: '1.0.0',
            timestamp: { toDate: () => new Date('2024-06-01') },
          }),
        },
        {
          id: 'feedback-2',
          data: () => ({
            userId: 'user-2',
            rating: 4,
            review: 'Good app',
            timestamp: { toDate: () => new Date('2024-05-15') },
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValueOnce({
        docs: mockFeedbackDocs,
      } as any);

      // Mock user lookups
      vi.mocked(getDoc)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({ fullName: 'User One', email: 'user1@example.com' }),
        } as any)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({ fullName: 'User Two', email: 'user2@example.com' }),
        } as any);

      const result = await getAllFeedback();

      expect(collection).toHaveBeenCalledWith({}, 'feedback');
      expect(query).toHaveBeenCalled();
      expect(orderBy).toHaveBeenCalledWith('timestamp', 'desc');
      expect(result.feedback).toHaveLength(2);
      expect(result.feedback[0]).toEqual({
        id: 'feedback-1',
        userId: 'user-1',
        rating: 5,
        review: 'Excellent app!',
        version: '1.0.0',
        timestamp: new Date('2024-06-01'),
        patientName: 'User One',
        patientEmail: 'user1@example.com',
      });
    });

    it('should apply limit when provided', async () => {
      vi.mocked(getDocs).mockResolvedValueOnce({
        docs: [],
      } as any);

      await getAllFeedback({ limit: 10 });

      expect(firestoreLimit).toHaveBeenCalledWith(10);
    });

    it('should apply startAfter when lastDoc is provided', async () => {
      const mockLastDoc = { id: 'last-doc' } as any;

      vi.mocked(getDocs).mockResolvedValueOnce({
        docs: [],
      } as any);

      await getAllFeedback({ lastDoc: mockLastDoc });

      expect(startAfter).toHaveBeenCalledWith(mockLastDoc);
    });

    it('should return lastDoc for pagination', async () => {
      const mockFeedbackDocs = [
        {
          id: 'feedback-1',
          data: () => ({
            userId: 'user-1',
            rating: 5,
            review: 'Test',
            timestamp: { toDate: () => new Date() },
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValueOnce({
        docs: mockFeedbackDocs,
      } as any);

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any);

      const result = await getAllFeedback();

      expect(result.lastDoc).toBe(mockFeedbackDocs[0]);
    });

    it('should return null lastDoc when no documents', async () => {
      vi.mocked(getDocs).mockResolvedValueOnce({
        docs: [],
      } as any);

      const result = await getAllFeedback();

      expect(result.lastDoc).toBeNull();
    });

    it('should handle user lookup failure gracefully', async () => {
      const mockFeedbackDocs = [
        {
          id: 'feedback-1',
          data: () => ({
            userId: 'user-1',
            rating: 5,
            review: 'Test',
            timestamp: { toDate: () => new Date() },
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValueOnce({
        docs: mockFeedbackDocs,
      } as any);

      vi.mocked(getDoc).mockRejectedValue(new Error('User not found'));

      const result = await getAllFeedback();

      expect(result.feedback[0].patientName).toBeUndefined();
      expect(result.feedback[0].patientEmail).toBeUndefined();
    });

    it('should throw error on Firestore failure', async () => {
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      await expect(getAllFeedback()).rejects.toThrow('Could not fetch feedback.');
    });
  });

  describe('getFeedbackById', () => {
    it('should return feedback by ID', async () => {
      vi.mocked(getDoc)
        .mockResolvedValueOnce({
          exists: () => true,
          id: 'feedback-123',
          data: () => ({
            userId: 'user-1',
            rating: 5,
            review: 'Great!',
            version: '2.0.0',
            timestamp: { toDate: () => new Date('2024-06-01') },
          }),
        } as any)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({ fullName: 'Test User', email: 'test@example.com' }),
        } as any);

      const result = await getFeedbackById('feedback-123');

      expect(doc).toHaveBeenCalledWith({}, 'feedback', 'feedback-123');
      expect(result).toEqual({
        id: 'feedback-123',
        userId: 'user-1',
        rating: 5,
        review: 'Great!',
        version: '2.0.0',
        timestamp: new Date('2024-06-01'),
        patientName: 'Test User',
        patientEmail: 'test@example.com',
      });
    });

    it('should return null if feedback does not exist', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any);

      const result = await getFeedbackById('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle missing review field', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'feedback-123',
        data: () => ({
          userId: 'user-1',
          rating: 4,
          timestamp: { toDate: () => new Date() },
        }),
      } as any);

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false,
      } as any);

      const result = await getFeedbackById('feedback-123');

      expect(result?.review).toBe('');
    });

    it('should throw error on Firestore failure', async () => {
      vi.mocked(getDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(getFeedbackById('feedback-123')).rejects.toThrow(
        'Could not fetch feedback.'
      );
    });
  });

  describe('getFeedbackStats', () => {
    it('should return correct statistics', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        forEach: (cb: (doc: any) => void) => {
          cb({ data: () => ({ rating: 5 }) });
          cb({ data: () => ({ rating: 5 }) });
          cb({ data: () => ({ rating: 4 }) });
          cb({ data: () => ({ rating: 3 }) });
          cb({ data: () => ({ rating: 1 }) });
        },
      } as any);

      const result = await getFeedbackStats();

      expect(result).toEqual({
        total: 5,
        averageRating: 3.6,
        distribution: {
          1: 1,
          2: 0,
          3: 1,
          4: 1,
          5: 2,
        },
      });
    });

    it('should return zero values when no feedback', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        forEach: () => {},
      } as any);

      const result = await getFeedbackStats();

      expect(result).toEqual({
        total: 0,
        averageRating: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      });
    });

    it('should ignore invalid ratings', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        forEach: (cb: (doc: any) => void) => {
          cb({ data: () => ({ rating: 5 }) });
          cb({ data: () => ({ rating: 0 }) }); // Invalid
          cb({ data: () => ({ rating: 6 }) }); // Invalid
          cb({ data: () => ({}) }); // No rating
        },
      } as any);

      const result = await getFeedbackStats();

      expect(result.total).toBe(1);
      expect(result.averageRating).toBe(5);
    });

    it('should throw error on Firestore failure', async () => {
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      await expect(getFeedbackStats()).rejects.toThrow(
        'Could not fetch feedback statistics.'
      );
    });
  });

  describe('getRecentFeedback', () => {
    it('should return recent feedback with default count', async () => {
      const mockFeedbackDocs = [
        {
          id: 'feedback-1',
          data: () => ({
            userId: 'user-1',
            rating: 5,
            review: 'Test',
            timestamp: { toDate: () => new Date() },
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValue({
        docs: mockFeedbackDocs,
      } as any);

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any);

      const result = await getRecentFeedback();

      expect(firestoreLimit).toHaveBeenCalledWith(5);
      expect(result).toHaveLength(1);
    });

    it('should return recent feedback with custom count', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        docs: [],
      } as any);

      await getRecentFeedback(10);

      expect(firestoreLimit).toHaveBeenCalledWith(10);
    });

    it('should throw error on Firestore failure', async () => {
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      await expect(getRecentFeedback()).rejects.toThrow(
        'Could not fetch recent feedback.'
      );
    });
  });
});
