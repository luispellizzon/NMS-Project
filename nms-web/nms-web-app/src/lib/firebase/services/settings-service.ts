// src/lib/firebase/services/settings-service.ts
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config';

/**
 * Saves or updates notification settings for a doctor.
 * @param uid The Firebase Auth UID of the doctor.
 * @param settings The notification settings.
 */
export const saveNotificationSettings = async (
  uid: string,
  settings: {
    email?: Record<string, boolean>;
    push?: Record<string, boolean>;
    inApp?: Record<string, boolean>;
  }
): Promise<void> => {
  try {
    const settingsDocRef = doc(db, 'user_settings', uid);
    await setDoc(
      settingsDocRef,
      {
        notifications: settings,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error saving notification settings:", error);
    throw new Error("Could not save notification settings.");
  }
};

/**
 * Gets notification settings for a doctor.
 * @param uid The Firebase Auth UID of the doctor.
 * @returns The notification settings or null if not found.
 */
export const getNotificationSettings = async (
  uid: string
): Promise<{
  email?: Record<string, boolean>;
  push?: Record<string, boolean>;
  inApp?: Record<string, boolean>;
} | null> => {
  try {
    const settingsDocRef = doc(db, 'user_settings', uid);
    const settingsSnapshot = await getDoc(settingsDocRef);

    if (settingsSnapshot.exists()) {
      return settingsSnapshot.data().notifications || null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    return null;
  }
};

/**
 * Saves or updates account preferences for a doctor.
 * @param uid The Firebase Auth UID of the doctor.
 * @param preferences The account preferences.
 */
export const saveAccountPreferences = async (
  uid: string,
  preferences: {
    language?: string;
    timezone?: string;
    dateFormat?: string;
    privacy?: Record<string, boolean>;
  }
): Promise<void> => {
  try {
    const settingsDocRef = doc(db, 'user_settings', uid);
    await setDoc(
      settingsDocRef,
      {
        preferences,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error saving account preferences:", error);
    throw new Error("Could not save account preferences.");
  }
};

/**
 * Gets account preferences for a doctor.
 * @param uid The Firebase Auth UID of the doctor.
 * @returns The account preferences or null if not found.
 */
export const getAccountPreferences = async (
  uid: string
): Promise<{
  language?: string;
  timezone?: string;
  dateFormat?: string;
  privacy?: Record<string, boolean>;
} | null> => {
  try {
    const settingsDocRef = doc(db, 'user_settings', uid);
    const settingsSnapshot = await getDoc(settingsDocRef);

    if (settingsSnapshot.exists()) {
      return settingsSnapshot.data().preferences || null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching account preferences:", error);
    return null;
  }
};