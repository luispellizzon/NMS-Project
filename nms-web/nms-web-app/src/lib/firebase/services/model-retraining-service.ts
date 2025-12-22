// src/lib/firebase/services/model-retraining-service.ts
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
import { db } from '../config';
import { v4 as uuidv4 } from 'uuid';
import { RetrainingLog, RetrainingResponse } from '@/types/anonymization';
import { getDoctorProfile } from './doctor-service';
import { getAnonymizedDataStats } from './anonymization-service';

// Hugging Face Space URL from environment
const HF_SPACE_URL = process.env.NEXT_PUBLIC_HF_SPACE_URL || 'https://lhpellizzon-nms-project.hf.space';
const HF_ADMIN_SECRET = process.env.NEXT_PUBLIC_HF_ADMIN_SECRET;

/**
 * Trigger model retraining on Hugging Face Space
 */
export async function triggerModelRetraining(
  doctorId: string
): Promise<RetrainingResponse> {
  try {
    // Validate admin secret is configured
    if (!HF_ADMIN_SECRET) {
      throw new Error('HF_ADMIN_SECRET is not configured');
    }

    // Get doctor info for logging
    const doctor = await getDoctorProfile(doctorId);
    if (!doctor) {
      throw new Error('Doctor not found');
    }

    // Get dataset stats to include in log
    const stats = await getAnonymizedDataStats();

    // Create training ID
    const trainingId = uuidv4();

    // Create initial log entry
    const logEntry: Partial<RetrainingLog> = {
      id: trainingId,
      triggeredBy: doctorId,
      triggeredByName: doctor.fullName,
      triggeredAt: serverTimestamp() as Timestamp,
      status: 'started',
      datasetSize: {
        baseRecords: 0, // Will be filled by HF Space
        newRecords: stats.newRecordsSinceLastTraining,
        totalRecords: stats.totalRecords,
      },
    };

    await setDoc(doc(db, 'model_retraining_logs', trainingId), logEntry);

    // Call Hugging Face Space endpoint
    // Note: The HF Space expects 'doctor_key' as a query parameter
    const response = await fetch(`${HF_SPACE_URL}/retrain?doctor_key=${encodeURIComponent(HF_ADMIN_SECRET)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HF Space returned error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    // Update log with in_progress status
    await setDoc(
      doc(db, 'model_retraining_logs', trainingId),
      {
        status: 'in_progress',
      },
      { merge: true }
    );

    return {
      success: true,
      trainingId,
      message: result.status || 'Retraining started successfully',
      estimatedDuration: '2-3 minutes',
    };
  } catch (error) {
    console.error('Error triggering model retraining:', error);

    return {
      success: false,
      message: 'Failed to trigger model retraining',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get retraining history
 */
export async function getRetrainingHistory(): Promise<RetrainingLog[]> {
  try {
    const logsRef = collection(db, 'model_retraining_logs');
    const q = query(logsRef, orderBy('triggeredAt', 'desc'));
    const snapshot = await getDocs(q);

    const logs: RetrainingLog[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        triggeredBy: data.triggeredBy,
        triggeredByName: data.triggeredByName,
        triggeredAt: data.triggeredAt,
        status: data.status,
        datasetSize: data.datasetSize || {
          baseRecords: 0,
          newRecords: 0,
          totalRecords: 0,
        },
        modelVersion: data.modelVersion,
        trainingMetrics: data.trainingMetrics,
        error: data.error,
        completedAt: data.completedAt,
        duration: data.duration,
      } as RetrainingLog;
    });

    return logs;
  } catch (error) {
    console.error('Error fetching retraining history:', error);
    throw new Error('Failed to fetch retraining history');
  }
}

/**
 * Save retraining log (for updating status from external sources)
 */
export async function saveRetrainingLog(
  trainingId: string,
  updates: Partial<RetrainingLog>
): Promise<void> {
  try {
    await setDoc(
      doc(db, 'model_retraining_logs', trainingId),
      {
        ...updates,
        lastUpdated: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error saving retraining log:', error);
    throw new Error('Failed to save retraining log');
  }
}

/**
 * Mark retraining as completed
 */
export async function markRetrainingCompleted(
  trainingId: string,
  metrics?: {
    loss: number;
    mae: number;
    epochs: number;
  }
): Promise<void> {
  try {
    const log = await getDocs(
      query(
        collection(db, 'model_retraining_logs'),
        orderBy('triggeredAt', 'desc')
      )
    );

    if (!log.empty) {
      const docData = log.docs[0].data();
      const startTime = docData.triggeredAt as Timestamp;
      const duration = Math.floor((Date.now() - startTime.toMillis()) / 1000);

      await setDoc(
        doc(db, 'model_retraining_logs', trainingId),
        {
          status: 'completed',
          completedAt: serverTimestamp(),
          duration,
          trainingMetrics: metrics,
        },
        { merge: true }
      );
    }
  } catch (error) {
    console.error('Error marking retraining as completed:', error);
    throw error;
  }
}

/**
 * Mark retraining as failed
 */
export async function markRetrainingFailed(
  trainingId: string,
  error: string
): Promise<void> {
  try {
    await setDoc(
      doc(db, 'model_retraining_logs', trainingId),
      {
        status: 'failed',
        error,
        completedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Error marking retraining as failed:', err);
    throw err;
  }
}