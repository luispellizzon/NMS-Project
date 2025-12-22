// src/lib/firebase/services/__tests__/settings-service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  saveNotificationSettings,
  getNotificationSettings,
  saveAccountPreferences,
  getAccountPreferences,
} from '../settings-service';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';

// Mock firebase/firestore
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn(() => ({})),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
}));

// Mock firebase config
vi.mock('../config', () => ({
  db: {},
}));

describe('settings-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('saveNotificationSettings', () => {
    it('should save notification settings successfully', async () => {
      const settings = {
        email: { newPatient: true, riskAlert: false },
        push: { newPatient: false, riskAlert: true },
        inApp: { newPatient: true, riskAlert: true },
      };

      vi.mocked(setDoc).mockResolvedValue(undefined as any);

      await saveNotificationSettings('user-123', settings);

      expect(doc).toHaveBeenCalledWith({}, 'user_settings', 'user-123');
      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        {
          notifications: settings,
          updatedAt: 'mock-timestamp',
        },
        { merge: true }
      );
    });

    it('should save partial notification settings', async () => {
      const settings = {
        email: { newPatient: true },
      };

      vi.mocked(setDoc).mockResolvedValue(undefined as any);

      await saveNotificationSettings('user-123', settings);

      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          notifications: settings,
        }),
        { merge: true }
      );
    });

    it('should throw error if save fails', async () => {
      vi.mocked(setDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(
        saveNotificationSettings('user-123', { email: { newPatient: true } })
      ).rejects.toThrow('Could not save notification settings.');
    });
  });

  describe('getNotificationSettings', () => {
    it('should return notification settings if they exist', async () => {
      const mockSettings = {
        email: { newPatient: true, riskAlert: false },
        push: { newPatient: false, riskAlert: true },
      };

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({
          notifications: mockSettings,
          updatedAt: 'mock-timestamp',
        }),
      } as any);

      const result = await getNotificationSettings('user-123');

      expect(doc).toHaveBeenCalledWith({}, 'user_settings', 'user-123');
      expect(result).toEqual(mockSettings);
    });

    it('should return null if document does not exist', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any);

      const result = await getNotificationSettings('user-123');

      expect(result).toBeNull();
    });

    it('should return null if notifications field is missing', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({
          updatedAt: 'mock-timestamp',
        }),
      } as any);

      const result = await getNotificationSettings('user-123');

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      vi.mocked(getDoc).mockRejectedValue(new Error('Firestore error'));

      const result = await getNotificationSettings('user-123');

      expect(result).toBeNull();
    });
  });

  describe('saveAccountPreferences', () => {
    it('should save account preferences successfully', async () => {
      const preferences = {
        language: 'en',
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        privacy: { showEmail: false, showPhone: true },
      };

      vi.mocked(setDoc).mockResolvedValue(undefined as any);

      await saveAccountPreferences('user-123', preferences);

      expect(doc).toHaveBeenCalledWith({}, 'user_settings', 'user-123');
      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        {
          preferences,
          updatedAt: 'mock-timestamp',
        },
        { merge: true }
      );
    });

    it('should save partial preferences', async () => {
      const preferences = {
        language: 'es',
      };

      vi.mocked(setDoc).mockResolvedValue(undefined as any);

      await saveAccountPreferences('user-123', preferences);

      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          preferences,
        }),
        { merge: true }
      );
    });

    it('should throw error if save fails', async () => {
      vi.mocked(setDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(
        saveAccountPreferences('user-123', { language: 'en' })
      ).rejects.toThrow('Could not save account preferences.');
    });
  });

  describe('getAccountPreferences', () => {
    it('should return account preferences if they exist', async () => {
      const mockPreferences = {
        language: 'en',
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        privacy: { showEmail: false },
      };

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({
          preferences: mockPreferences,
          updatedAt: 'mock-timestamp',
        }),
      } as any);

      const result = await getAccountPreferences('user-123');

      expect(doc).toHaveBeenCalledWith({}, 'user_settings', 'user-123');
      expect(result).toEqual(mockPreferences);
    });

    it('should return null if document does not exist', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any);

      const result = await getAccountPreferences('user-123');

      expect(result).toBeNull();
    });

    it('should return null if preferences field is missing', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({
          updatedAt: 'mock-timestamp',
        }),
      } as any);

      const result = await getAccountPreferences('user-123');

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      vi.mocked(getDoc).mockRejectedValue(new Error('Firestore error'));

      const result = await getAccountPreferences('user-123');

      expect(result).toBeNull();
    });
  });
});
