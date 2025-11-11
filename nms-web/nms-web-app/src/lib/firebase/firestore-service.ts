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
  deleteDoc
} from 'firebase/firestore';
import { db } from './config';
import { Patient } from '@/types/patient';
import { Doctor, NewDoctorData, DoctorPatientRelationship } from '@/types/doctor';

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