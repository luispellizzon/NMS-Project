// src/lib/firebase/services/__tests__/support-service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAllSupportRequests,
  getSupportRequestById,
  updateSupportRequestStatus,
  getSupportStats,
  getRecentOpenRequests,
} from '../support-service';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
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
  updateDoc: vi.fn(),
  query: vi.fn(() => ({})),
  where: vi.fn(() => ({})),
  orderBy: vi.fn(() => ({})),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
  limit: vi.fn(() => ({})),
  startAfter: vi.fn(() => ({})),
}));

// Mock firebase config
vi.mock('../config', () => ({
  db: {},
}));

describe('support-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllSupportRequests', () => {
    it('should return all support requests', async () => {
      const mockRequestDocs = [
        {
          id: 'request-1',
          data: () => ({
            userId: 'user-1',
            subject: 'Login issue',
            message: 'Cannot login to app',
            status: 'open',
            priority: 'high',
            createdAt: { toDate: () => new Date('2024-06-01') },
          }),
        },
        {
          id: 'request-2',
          data: () => ({
            userId: 'user-2',
            subject: 'Feature request',
            message: 'Add dark mode',
            status: 'closed',
            priority: 'low',
            createdAt: { toDate: () => new Date('2024-05-01') },
            resolvedAt: { toDate: () => new Date('2024-05-15') },
            resolvedBy: 'admin-1',
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValueOnce({
        docs: mockRequestDocs,
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

      const result = await getAllSupportRequests();

      expect(collection).toHaveBeenCalledWith({}, 'support_requests');
      expect(query).toHaveBeenCalled();
      expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(result.requests).toHaveLength(2);
      expect(result.requests[0]).toEqual({
        id: 'request-1',
        userId: 'user-1',
        subject: 'Login issue',
        message: 'Cannot login to app',
        status: 'open',
        priority: 'high',
        createdAt: new Date('2024-06-01'),
        updatedAt: undefined,
        resolvedAt: undefined,
        resolvedBy: undefined,
        patientName: 'User One',
        patientEmail: 'user1@example.com',
      });
    });

    it('should filter by status when provided', async () => {
      vi.mocked(getDocs).mockResolvedValueOnce({
        docs: [],
      } as any);

      await getAllSupportRequests('open');

      expect(where).toHaveBeenCalledWith('status', '==', 'open');
    });

    it('should apply pagination options', async () => {
      const mockLastDoc = { id: 'last-doc' } as any;

      vi.mocked(getDocs).mockResolvedValueOnce({
        docs: [],
      } as any);

      await getAllSupportRequests(undefined, { limit: 10, lastDoc: mockLastDoc });

      expect(firestoreLimit).toHaveBeenCalledWith(10);
      expect(startAfter).toHaveBeenCalledWith(mockLastDoc);
    });

    it('should return lastDoc for pagination', async () => {
      const mockRequestDocs = [
        {
          id: 'request-1',
          data: () => ({
            userId: 'user-1',
            subject: 'Test',
            message: 'Test message',
            status: 'open',
            createdAt: { toDate: () => new Date() },
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValueOnce({
        docs: mockRequestDocs,
      } as any);

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any);

      const result = await getAllSupportRequests();

      expect(result.lastDoc).toBe(mockRequestDocs[0]);
    });

    it('should handle user lookup failure gracefully', async () => {
      const mockRequestDocs = [
        {
          id: 'request-1',
          data: () => ({
            userId: 'user-1',
            subject: 'Test',
            message: 'Test',
            status: 'open',
            createdAt: { toDate: () => new Date() },
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValueOnce({
        docs: mockRequestDocs,
      } as any);

      vi.mocked(getDoc).mockRejectedValue(new Error('User not found'));

      const result = await getAllSupportRequests();

      expect(result.requests[0].patientName).toBeUndefined();
      expect(result.requests[0].patientEmail).toBeUndefined();
    });

    it('should throw error on Firestore failure', async () => {
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      await expect(getAllSupportRequests()).rejects.toThrow(
        'Could not fetch support requests.'
      );
    });
  });

  describe('getSupportRequestById', () => {
    it('should return support request by ID', async () => {
      vi.mocked(getDoc)
        .mockResolvedValueOnce({
          exists: () => true,
          id: 'request-123',
          data: () => ({
            userId: 'user-1',
            subject: 'Help needed',
            message: 'I need help with...',
            status: 'in_progress',
            priority: 'medium',
            createdAt: { toDate: () => new Date('2024-06-01') },
            updatedAt: { toDate: () => new Date('2024-06-02') },
          }),
        } as any)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({ fullName: 'Test User', email: 'test@example.com' }),
        } as any);

      const result = await getSupportRequestById('request-123');

      expect(doc).toHaveBeenCalledWith({}, 'support_requests', 'request-123');
      expect(result).toEqual({
        id: 'request-123',
        userId: 'user-1',
        subject: 'Help needed',
        message: 'I need help with...',
        status: 'in_progress',
        priority: 'medium',
        createdAt: new Date('2024-06-01'),
        updatedAt: new Date('2024-06-02'),
        resolvedAt: undefined,
        resolvedBy: undefined,
        patientName: 'Test User',
        patientEmail: 'test@example.com',
      });
    });

    it('should return null if request does not exist', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any);

      const result = await getSupportRequestById('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle missing fields with defaults', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'request-123',
        data: () => ({
          userId: 'user-1',
          createdAt: { toDate: () => new Date() },
        }),
      } as any);

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false,
      } as any);

      const result = await getSupportRequestById('request-123');

      expect(result?.subject).toBe('');
      expect(result?.message).toBe('');
      expect(result?.status).toBe('open');
      expect(result?.priority).toBe('medium');
    });

    it('should throw error on Firestore failure', async () => {
      vi.mocked(getDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(getSupportRequestById('request-123')).rejects.toThrow(
        'Could not fetch support request.'
      );
    });
  });

  describe('updateSupportRequestStatus', () => {
    it('should update status without resolvedBy', async () => {
      vi.mocked(updateDoc).mockResolvedValue(undefined as any);

      await updateSupportRequestStatus('request-123', 'in_progress');

      expect(doc).toHaveBeenCalledWith({}, 'support_requests', 'request-123');
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'in_progress',
          updatedAt: 'mock-timestamp',
        })
      );
    });

    it('should add resolvedAt and resolvedBy when status is resolved', async () => {
      vi.mocked(updateDoc).mockResolvedValue(undefined as any);

      await updateSupportRequestStatus('request-123', 'resolved', 'admin-123');

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'resolved',
          updatedAt: 'mock-timestamp',
          resolvedAt: 'mock-timestamp',
          resolvedBy: 'admin-123',
        })
      );
    });

    it('should add resolvedAt when status is closed', async () => {
      vi.mocked(updateDoc).mockResolvedValue(undefined as any);

      await updateSupportRequestStatus('request-123', 'closed');

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'closed',
          resolvedAt: 'mock-timestamp',
        })
      );
    });

    it('should throw error on Firestore failure', async () => {
      vi.mocked(updateDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(
        updateSupportRequestStatus('request-123', 'resolved')
      ).rejects.toThrow('Could not update support request status.');
    });
  });

  describe('getSupportStats', () => {
    it('should return correct statistics', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        forEach: (cb: (doc: any) => void) => {
          cb({ data: () => ({ status: 'open' }) });
          cb({ data: () => ({ status: 'open' }) });
          cb({ data: () => ({ status: 'in_progress' }) });
          cb({ data: () => ({ status: 'resolved' }) });
          cb({ data: () => ({ status: 'closed' }) });
        },
      } as any);

      const result = await getSupportStats();

      expect(result).toEqual({
        total: 5,
        open: 2,
        inProgress: 1,
        resolved: 1,
        closed: 1,
      });
    });

    it('should return zero values when no requests', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        forEach: () => {},
      } as any);

      const result = await getSupportStats();

      expect(result).toEqual({
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
      });
    });

    it('should count undefined status as open', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        forEach: (cb: (doc: any) => void) => {
          cb({ data: () => ({}) });
          cb({ data: () => ({ status: undefined }) });
        },
      } as any);

      const result = await getSupportStats();

      expect(result.total).toBe(2);
      expect(result.open).toBe(2);
    });

    it('should throw error on Firestore failure', async () => {
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      await expect(getSupportStats()).rejects.toThrow(
        'Could not fetch support statistics.'
      );
    });
  });

  describe('getRecentOpenRequests', () => {
    it('should return recent open requests with default count', async () => {
      const mockRequestDocs = [
        {
          id: 'request-1',
          data: () => ({
            userId: 'user-1',
            subject: 'Test',
            message: 'Test',
            status: 'open',
            createdAt: { toDate: () => new Date() },
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValue({
        docs: mockRequestDocs,
      } as any);

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any);

      const result = await getRecentOpenRequests();

      expect(where).toHaveBeenCalledWith('status', '==', 'open');
      expect(firestoreLimit).toHaveBeenCalledWith(5);
      expect(result).toHaveLength(1);
    });

    it('should return recent open requests with custom count', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        docs: [],
      } as any);

      await getRecentOpenRequests(10);

      expect(firestoreLimit).toHaveBeenCalledWith(10);
    });

    it('should throw error on Firestore failure', async () => {
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      await expect(getRecentOpenRequests()).rejects.toThrow(
        'Could not fetch recent open requests.'
      );
    });
  });
});
