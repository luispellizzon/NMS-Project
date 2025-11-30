// src/lib/firebase/services/helpers.ts
import { Timestamp } from 'firebase/firestore';

/**
 * Helper function to convert Timestamp/Date/string to string
 */
export const convertToDateString = (dateValue: string | Timestamp | Date): string => {
  if (typeof dateValue === 'string') {
    return dateValue;
  } else if (dateValue instanceof Date) {
    return dateValue.toISOString();
  } else {
    // Firestore Timestamp
    return dateValue.toDate().toISOString();
  }
};

/**
 * Helper function to format date from Firestore timestamp string
 */
export const formatDate = (dateValue: string | Timestamp | Date): string => {
  try {
    const dateString = convertToDateString(dateValue);
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (error) {
    return typeof dateValue === 'string' ? dateValue : 'Invalid Date';
  }
};

/**
 * Helper function to format time duration
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
};