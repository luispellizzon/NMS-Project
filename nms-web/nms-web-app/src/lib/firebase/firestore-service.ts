// src/lib/firebase/firestore-service.ts
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  getDoc,
  deleteDoc,
  orderBy
} from 'firebase/firestore';
import { db } from './config';
import { Patient } from '@/types/patient';
import { Doctor, NewDoctorData, DoctorPatientRelationship } from '@/types/doctor';
import { SpeechAssessment, MemoryTest, TestHistoryItem } from '@/types/testHistory';

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
 * Creates a new doctor document in the 'doctors' collection.
 * @param uid The Firebase Auth UID of the doctor.
 * @param doctorData The data for the new doctor.
 * @returns The doctor's UID.
 */
export const createDoctorProfile = async (uid: string, doctorData: NewDoctorData): Promise<string> => {
  try {
    // Use the auth UID as the document ID for easy lookup
    const doctorDocRef = doc(db, 'doctors', uid);
    await setDoc(doctorDocRef, {
      ...doctorData,
      id: uid,
      createdAt: serverTimestamp(),
    });
    return uid;
  } catch (error) {
    console.error("Error creating doctor profile:", error);
    throw new Error("Could not create doctor profile.");
  }
};

/**
 * Gets a doctor's profile by their UID.
 * @param uid The Firebase Auth UID of the doctor.
 * @returns The doctor's profile or null if not found.
 */
export const getDoctorProfile = async (uid: string): Promise<Doctor | null> => {
  try {
    const doctorDocRef = doc(db, 'doctors', uid);
    const doctorSnapshot = await getDoc(doctorDocRef);

    if (doctorSnapshot.exists()) {
      const data = doctorSnapshot.data();
      return {
        id: doctorSnapshot.id,
        fullName: data.fullName,
        email: data.email,
        role: 'doctor',
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Doctor;
    }
    return null;
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    throw new Error("Could not fetch doctor profile.");
  }
};

/**
 * Assigns a patient to a doctor.
 * @param doctorId The Firebase Auth UID of the doctor.
 * @param patientId The Firebase Auth UID of the patient.
 * @param notes Optional notes about the relationship.
 * @returns The ID of the relationship document.
 */
export const assignPatientToDoctor = async (
  doctorId: string,
  patientId: string,
  notes?: string
): Promise<string> => {
  try {
    // Check if relationship already exists
    const relationshipsRef = collection(db, 'doctor_patients');
    const existingQuery = query(
      relationshipsRef,
      where('doctorId', '==', doctorId),
      where('patientId', '==', patientId)
    );
    const existingDocs = await getDocs(existingQuery);

    if (!existingDocs.empty) {
      throw new Error("Patient is already assigned to this doctor.");
    }

    const newRelationshipRef = await addDoc(relationshipsRef, {
      doctorId,
      patientId,
      assignedAt: serverTimestamp(),
      notes: notes || null,
    });

    return newRelationshipRef.id;
  } catch (error) {
    console.error("Error assigning patient to doctor:", error);
    throw error;
  }
};

/**
 * Removes a patient from a doctor's list.
 * @param doctorId The Firebase Auth UID of the doctor.
 * @param patientId The Firebase Auth UID of the patient.
 */
export const removePatientFromDoctor = async (
  doctorId: string,
  patientId: string
): Promise<void> => {
  try {
    const relationshipsRef = collection(db, 'doctor_patients');
    const q = query(
      relationshipsRef,
      where('doctorId', '==', doctorId),
      where('patientId', '==', patientId)
    );
    const querySnapshot = await getDocs(q);

    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error removing patient from doctor:", error);
    throw new Error("Could not remove patient from doctor.");
  }
};

/**
 * Gets all patients assigned to a specific doctor.
 * @param doctorId The Firebase Auth UID of the doctor.
 * @returns Array of patient IDs assigned to this doctor.
 */
export const getDoctorPatients = async (doctorId: string): Promise<string[]> => {
  try {
    const relationshipsRef = collection(db, 'doctor_patients');
    const q = query(relationshipsRef, where('doctorId', '==', doctorId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => doc.data().patientId);
  } catch (error) {
    console.error("Error fetching doctor's patients:", error);
    throw new Error("Could not fetch doctor's patients.");
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
 * Gets risk assessment data for a specific patient.
 * @param userId The user's UID.
 * @returns Risk assessment data or null if not found.
 */
export const getPatientRiskAssessment = async (userId: string): Promise<any | null> => {
  try {
    // Query by document ID
    const assessmentDocRef = doc(db, 'risk_assessments', userId);
    const assessmentSnapshot = await getDoc(assessmentDocRef);

    if (assessmentSnapshot.exists()) {
      return {
        id: assessmentSnapshot.id,
        ...assessmentSnapshot.data(),
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
        id: patientSnapshot.id,
        fullName: data.fullName || 'Unknown',
        email: data.email || '',
        dateOfBirth: data.dateOfBirth || '',
        role: data.role,
        createdAt: data.createdAt?.toDate() || new Date(),
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
 * Helper function to format date from Firestore timestamp string
 */
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (error) {
    return dateString;
  }
};

/**
 * Helper function to format time duration
 */
const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
};

/**
 * Gets a patient's speech assessments from subcollection.
 * @param patientId The patient's UID.
 * @returns Array of speech assessments.
 */
export const getPatientSpeechAssessments = async (patientId: string): Promise<SpeechAssessment[]> => {
  try {
    const speechAssessmentsRef = collection(db, 'users', patientId, 'speech_assessment');
    const q = query(speechAssessmentsRef, orderBy('completedAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        aiAnalysis: data.aiAnalysis,
        completedAt: data.completedAt,
        startedAt: data.startedAt,
        isCompleted: data.isCompleted,
        totalScore: data.totalScore,
        currentTaskId: data.currentTaskId,
        content: data.content,
      } as SpeechAssessment;
    });
  } catch (error) {
    console.error("Error fetching patient speech assessments:", error);
    return [];
  }
};

/**
 * Gets a patient's memory tests from subcollection.
 * @param patientId The patient's UID.
 * @returns Array of memory tests.
 */
export const getPatientMemoryTests = async (patientId: string): Promise<MemoryTest[]> => {
  try {
    const memoryTestsRef = collection(db, 'users', patientId, 'memory_tests');
    const q = query(memoryTestsRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        completionTime: data.completionTime,
        score: data.score,
        status: data.status,
        testType: data.testType,
        timestamp: data.timestamp,
        totalQuestions: data.totalQuestions,
      } as MemoryTest;
    });
  } catch (error) {
    console.error("Error fetching patient memory tests:", error);
    return [];
  }
};

/**
 * Gets a patient's complete test history (speech assessments + memory tests).
 * @param patientId The patient's UID.
 * @returns Array of unified test history items.
 */
export const getPatientTestHistory = async (patientId: string): Promise<TestHistoryItem[]> => {
  try {
    // Fetch both speech assessments and memory tests in parallel
    const [speechAssessments, memoryTests] = await Promise.all([
      getPatientSpeechAssessments(patientId),
      getPatientMemoryTests(patientId),
    ]);

    // Convert speech assessments to unified format
    const speechHistory: TestHistoryItem[] = speechAssessments
      .filter(assessment => assessment.isCompleted)
      .map(assessment => {
        // Calculate total duration from all tasks
        const totalDuration = Object.values(assessment.content).reduce(
          (sum, task) => sum + (task.result?.duration || 0),
          0
        );
        const durationInSeconds = Math.round(totalDuration / 1000);

        // Calculate max score from all tasks
        const maxScore = Object.values(assessment.content).reduce(
          (sum, task) => sum + (task.maxScore || 0),
          0
        );

        return {
          id: assessment.id,
          date: formatDate(assessment.completedAt),
          test: 'Speech Assessment',
          testType: 'speech' as const,
          timeTaken: formatDuration(durationInSeconds),
          score: `${assessment.totalScore}/${maxScore}`,
          rawData: assessment,
        };
      });

    // Convert memory tests to unified format
    const memoryHistory: TestHistoryItem[] = memoryTests
      .filter(test => test.status === 'completed')
      .map(test => ({
        id: test.id,
        date: formatDate(test.timestamp),
        test: test.testType === 'memory_mcq' ? 'Memory Test (MCQ)' : 'Memory Test',
        testType: 'memory' as const,
        timeTaken: formatDuration(test.completionTime),
        score: `${test.score}/${test.totalQuestions}`,
        rawData: test,
      }));

    // Combine and sort by date (most recent first)
    const allHistory = [...speechHistory, ...memoryHistory];
    allHistory.sort((a, b) => {
      const dateA = a.testType === 'speech'
        ? new Date((a.rawData as SpeechAssessment).completedAt)
        : new Date((a.rawData as MemoryTest).timestamp);
      const dateB = b.testType === 'speech'
        ? new Date((b.rawData as SpeechAssessment).completedAt)
        : new Date((b.rawData as MemoryTest).timestamp);
      return dateB.getTime() - dateA.getTime();
    });

    return allHistory;
  } catch (error) {
    console.error("Error fetching patient test history:", error);
    return [];
  }
};