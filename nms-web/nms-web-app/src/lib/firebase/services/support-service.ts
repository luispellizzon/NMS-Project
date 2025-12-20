// src/lib/firebase/services/support-service.ts

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
  DocumentSnapshot,
  limit as firestoreLimit,
  startAfter,
} from 'firebase/firestore';
import { db } from '../config';
import { SupportRequest, SupportRequestStatus, SupportStats } from '@/types/admin';

/**
 * Gets all support requests with optional status filtering.
 * @param status Optional status to filter by.
 * @param options Pagination options.
 * @returns Array of support requests.
 */
export const getAllSupportRequests = async (
  status?: SupportRequestStatus,
  options?: {
    limit?: number;
    lastDoc?: DocumentSnapshot;
  }
): Promise<{ requests: SupportRequest[]; lastDoc: DocumentSnapshot | null }> => {
  try {
    const supportRef = collection(db, 'support_requests');
    let q = query(supportRef, orderBy('createdAt', 'desc'));

    if (status) {
      q = query(supportRef, where('status', '==', status), orderBy('createdAt', 'desc'));
    }

    if (options?.limit) {
      q = query(q, firestoreLimit(options.limit));
    }

    if (options?.lastDoc) {
      q = query(q, startAfter(options.lastDoc));
    }

    const querySnapshot = await getDocs(q);

    const requests: SupportRequest[] = await Promise.all(
      querySnapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();

        // Optionally fetch patient details
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
          subject: data.subject || '',
          message: data.message || '',
          status: data.status || 'open',
          priority: data.priority || 'medium',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate(),
          resolvedAt: data.resolvedAt?.toDate(),
          resolvedBy: data.resolvedBy,
          patientName,
          patientEmail,
        };
      })
    );

    const lastDoc = querySnapshot.docs.length > 0
      ? querySnapshot.docs[querySnapshot.docs.length - 1]
      : null;

    return { requests, lastDoc };
  } catch (error) {
    console.error('Error fetching support requests:', error);
    throw new Error('Could not fetch support requests.');
  }
};

/**
 * Gets a single support request by ID.
 * @param requestId The support request document ID.
 * @returns The support request or null if not found.
 */
export const getSupportRequestById = async (requestId: string): Promise<SupportRequest | null> => {
  try {
    const requestDocRef = doc(db, 'support_requests', requestId);
    const requestSnapshot = await getDoc(requestDocRef);

    if (!requestSnapshot.exists()) {
      return null;
    }

    const data = requestSnapshot.data();

    // Optionally fetch patient details
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
      id: requestSnapshot.id,
      userId: data.userId,
      subject: data.subject || '',
      message: data.message || '',
      status: data.status || 'open',
      priority: data.priority || 'medium',
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate(),
      resolvedAt: data.resolvedAt?.toDate(),
      resolvedBy: data.resolvedBy,
      patientName,
      patientEmail,
    };
  } catch (error) {
    console.error('Error fetching support request:', error);
    throw new Error('Could not fetch support request.');
  }
};

/**
 * Updates the status of a support request.
 * @param requestId The support request document ID.
 * @param status The new status.
 * @param resolvedBy Optional admin ID who resolved the request.
 */
export const updateSupportRequestStatus = async (
  requestId: string,
  status: SupportRequestStatus,
  resolvedBy?: string
): Promise<void> => {
  try {
    const requestDocRef = doc(db, 'support_requests', requestId);

    const updates: Record<string, unknown> = {
      status,
      updatedAt: serverTimestamp(),
    };

    if (status === 'resolved' || status === 'closed') {
      updates.resolvedAt = serverTimestamp();
      if (resolvedBy) {
        updates.resolvedBy = resolvedBy;
      }
    }

    await updateDoc(requestDocRef, updates);
  } catch (error) {
    console.error('Error updating support request status:', error);
    throw new Error('Could not update support request status.');
  }
};

/**
 * Gets statistics about support requests.
 * @returns Support request statistics.
 */
export const getSupportStats = async (): Promise<SupportStats> => {
  try {
    const supportRef = collection(db, 'support_requests');
    const querySnapshot = await getDocs(supportRef);

    let total = 0;
    let open = 0;
    let inProgress = 0;
    let resolved = 0;
    let closed = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      total++;

      switch (data.status) {
        case 'open':
          open++;
          break;
        case 'in_progress':
          inProgress++;
          break;
        case 'resolved':
          resolved++;
          break;
        case 'closed':
          closed++;
          break;
        default:
          open++; // Default to open if no status
      }
    });

    return {
      total,
      open,
      inProgress,
      resolved,
      closed,
    };
  } catch (error) {
    console.error('Error fetching support stats:', error);
    throw new Error('Could not fetch support statistics.');
  }
};

/**
 * Gets recent open support requests.
 * @param count Number of requests to fetch.
 * @returns Array of recent open support requests.
 */
export const getRecentOpenRequests = async (count: number = 5): Promise<SupportRequest[]> => {
  try {
    const { requests } = await getAllSupportRequests('open', { limit: count });
    return requests;
  } catch (error) {
    console.error('Error fetching recent open requests:', error);
    throw new Error('Could not fetch recent open requests.');
  }
};
