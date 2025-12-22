// src/lib/firebase/services/patient-service.ts
import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config';

// Define the shape of the data we'll send to Firestore
// This excludes fields that will be generated automatically
// Note: gender and age are stored in risk_assessments collection
type NewPatientData = {
  fullName: string;
  email: string;
  dateOfBirth: string;
  role: 'patient';
};

/**
 * Adds a new patient document to the 'users' collection in Firestore.
 * @param patientData The data for the new patient.
 * @returns The ID of the newly created document.
 */
export const addPatient = async (patientData: NewPatientData): Promise<string> => {
  try {
    const usersCollectionRef = collection(db, 'users');
    const newDocRef = await addDoc(usersCollectionRef, {
      ...patientData,
      createdAt: serverTimestamp(), // Adds a server-side timestamp
    });

    // We'll also add the UID to the document itself for easy access
    await setDoc(doc(db, 'users', newDocRef.id), { uid: newDocRef.id }, { merge: true });

    return newDocRef.id;
  } catch (error) {
    console.error("Error adding patient to Firestore:", error);
    // In a real app, you'd want more robust error handling here
    throw new Error("Could not add patient.");
  }
};

/**
 * Gets all patients from the users collection (for assignment).
 * @returns Array of patient user IDs.
 */
export const getAllPatients = async (): Promise<Array<{ id: string; fullName: string; email: string }>> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', 'patient'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        fullName: data.fullName || 'Unknown',
        email: data.email || '',
      };
    });
  } catch (error) {
    console.error("Error fetching all patients:", error);
    throw new Error("Could not fetch patients.");
  }
};

/**
 * Gets risk assessment data for a specific patient from user's subcollection.
 * @param userId The user's UID.
 * @returns Risk assessment data or null if not found.
 */
export const getPatientRiskAssessment = async (userId: string): Promise<any | null> => {
  try {
    // Query risk_assessment subcollection under users/{userId}/risk_assessment
    const riskAssessmentRef = collection(db, 'users', userId, 'risk_assessment');
    const querySnapshot = await getDocs(riskAssessmentRef);

    if (!querySnapshot.empty) {
      // Get the first (or most recent) assessment
      const assessmentDoc = querySnapshot.docs[0];
      return {
        id: assessmentDoc.id,
        ...assessmentDoc.data(),
      };
    }

    console.warn(`No risk assessment found for user ID: ${userId}`);
    return null;
  } catch (error) {
    console.error("Error fetching patient risk assessment:", error);
    return null;
  }
};

/**
 * Gets a patient's basic information by their ID.
 * @param patientId The patient's UID.
 * @returns Patient basic info or null if not found.
 */
export const getPatientById = async (patientId: string): Promise<any | null> => {
  try {
    const patientDocRef = doc(db, 'users', patientId);
    const patientSnapshot = await getDoc(patientDocRef);

    if (patientSnapshot.exists()) {
      const data = patientSnapshot.data();
      return {
        uid: patientSnapshot.id,
        id: patientSnapshot.id,
        fullName: data.fullName || 'Unknown',
        email: data.email || '',
        dateOfBirth: data.dateOfBirth || '',
        role: data.role,
        location: data.location,
        createdAt: data.createdAt?.toDate() || new Date(),

        // Risk assessment fields
        riskScore: data.riskScore,
        riskLevel: data.riskLevel,
        trend: data.trend,

        // Clinical metrics
        mmseScore: data.mmseScore,

        // Task completion status
        currentTask: data.currentTask,
        hasCompletedCognitiveAssessment: data.hasCompletedCognitiveAssessment,
        hasCompletedImageDescription: data.hasCompletedImageDescription,
        hasCompletedMemoryAssessment: data.hasCompletedMemoryAssessment,
        hasCompletedRiskAssessment: data.hasCompletedRiskAssessment,
        hasCompletedSpeechAssessment: data.hasCompletedSpeechAssessment,

        // AI model prediction
        dementiaModelPrediction: data.dementiaRisk,

        // Data usage consent
        dataUsageConsent: data.dataUsageConsent,
        dataUsageConsentDate: data.dataUsageConsentDate,
      };
    }

    console.warn(`No patient found with ID: ${patientId}`);
    return null;
  } catch (error) {
    console.error("Error fetching patient by ID:", error);
    return null;
  }
};

/**
 * Gets a patient's game scores.
 * @param patientId The patient's UID.
 * @returns Game scores or null if not found.
 */
export const getPatientGameScores = async (patientId: string): Promise<any | null> => {
  try {
    const scoresDocRef = doc(db, 'game_scores', patientId);
    const scoresSnapshot = await getDoc(scoresDocRef);

    if (scoresSnapshot.exists()) {
      return {
        id: scoresSnapshot.id,
        ...scoresSnapshot.data(),
      };
    }

    console.warn(`No game scores found for patient ID: ${patientId}`);
    return null;
  } catch (error) {
    console.error("Error fetching patient game scores:", error);
    return null;
  }
};

/**
 * Updates a patient's basic information in the 'users' collection.
 * @param patientId The patient's UID.
 * @param updates Partial patient data to update.
 * @returns void
 */
export const updatePatient = async (
  patientId: string,
  updates: Partial<{
    fullName: string;
    email: string;
    dateOfBirth: string;
    location: string;
  }>
): Promise<void> => {
  try {
    const patientDocRef = doc(db, 'users', patientId);
    await updateDoc(patientDocRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating patient:", error);
    throw new Error("Could not update patient.");
  }
};