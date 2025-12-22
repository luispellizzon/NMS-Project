// src/lib/firebase/services/feedback-service.ts

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit as firestoreLimit,
  startAfter,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../config';
import { Feedback, FeedbackStats } from '@/types/admin';

/**
 * Gets all feedback from the feedback collection.
 * Supports pagination.
 * @param options Pagination options.
 * @returns Array of feedback entries.
 */
export const getAllFeedback = async (options?: {
  limit?: number;
  lastDoc?: DocumentSnapshot;
}): Promise<{ feedback: Feedback[]; lastDoc: DocumentSnapshot | null }> => {
  try {
    const feedbackRef = collection(db, 'feedback');
    let q = query(feedbackRef, orderBy('timestamp', 'desc'));

    if (options?.limit) {
      q = query(q, firestoreLimit(options.limit));
    }

    if (options?.lastDoc) {
      q = query(q, startAfter(options.lastDoc));
    }

    const querySnapshot = await getDocs(q);

    const feedback: Feedback[] = await Promise.all(
      querySnapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();

        // Optionally fetch patient name
        let patientName: string | undefined;
        let patientEmail: string | undefined;

        if (data.userId) {
          try {
            const userDocRef = doc(db, 'users', data.userId);
            const userSnapshot = await getDoc(userDocRef);
            if (userSnapshot.exists()) {
              const userData = userSnapshot.data();
              patientName = userData.fullName;
              patientEmail = userData.email;
            }
          } catch {
            // Silently fail if user not found
          }
        }

        return {
          id: docSnapshot.id,
          userId: data.userId,
          rating: data.rating,
          review: data.review || '',
          version: data.version || '',
          timestamp: data.timestamp?.toDate() || new Date(),
          patientName,
          patientEmail,
        };
      })
    );

    const lastDoc = querySnapshot.docs.length > 0
      ? querySnapshot.docs[querySnapshot.docs.length - 1]
      : null;

    return { feedback, lastDoc };
  } catch (error) {
    console.error('Error fetching feedback:', error);
    throw new Error('Could not fetch feedback.');
  }
};

/**
 * Gets a single feedback entry by ID.
 * @param feedbackId The feedback document ID.
 * @returns The feedback entry or null if not found.
 */
export const getFeedbackById = async (feedbackId: string): Promise<Feedback | null> => {
  try {
    const feedbackDocRef = doc(db, 'feedback', feedbackId);
    const feedbackSnapshot = await getDoc(feedbackDocRef);

    if (!feedbackSnapshot.exists()) {
      return null;
    }

    const data = feedbackSnapshot.data();

    // Optionally fetch patient name
    let patientName: string | undefined;
    let patientEmail: string | undefined;

    if (data.userId) {
      try {
        const userDocRef = doc(db, 'users', data.userId);
        const userSnapshot = await getDoc(userDocRef);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          patientName = userData.fullName;
          patientEmail = userData.email;
        }
      } catch {
        // Silently fail if user not found
      }
    }

    return {
      id: feedbackSnapshot.id,
      userId: data.userId,
      rating: data.rating,
      review: data.review || '',
      version: data.version || '',
      timestamp: data.timestamp?.toDate() || new Date(),
      patientName,
      patientEmail,
    };
  } catch (error) {
    console.error('Error fetching feedback by ID:', error);
    throw new Error('Could not fetch feedback.');
  }
};

/**
 * Gets statistics about all feedback.
 * @returns Feedback statistics including average rating and distribution.
 */
export const getFeedbackStats = async (): Promise<FeedbackStats> => {
  try {
    const feedbackRef = collection(db, 'feedback');
    const querySnapshot = await getDocs(feedbackRef);

    let total = 0;
    let totalRating = 0;
    const distribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.rating && data.rating >= 1 && data.rating <= 5) {
        total++;
        totalRating += data.rating;
        distribution[data.rating] = (distribution[data.rating] || 0) + 1;
      }
    });

    const averageRating = total > 0 ? Math.round((totalRating / total) * 10) / 10 : 0;

    return {
      total,
      averageRating,
      distribution,
    };
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    throw new Error('Could not fetch feedback statistics.');
  }
};

/**
 * Gets recent feedback entries (last N).
 * @param count Number of recent feedback entries to fetch.
 * @returns Array of recent feedback entries.
 */
export const getRecentFeedback = async (count: number = 5): Promise<Feedback[]> => {
  try {
    const { feedback } = await getAllFeedback({ limit: count });
    return feedback;
  } catch (error) {
    console.error('Error fetching recent feedback:', error);
    throw new Error('Could not fetch recent feedback.');
  }
};
