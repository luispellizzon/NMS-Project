// src/lib/firebase/services/doctor-service.ts
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config';
import { Doctor, NewDoctorData } from '@/types/doctor';

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
 * Updates a doctor's profile information.
 * @param uid The Firebase Auth UID of the doctor.
 * @param updates The fields to update.
 */
export const updateDoctorProfile = async (
  uid: string,
  updates: Partial<{
    fullName: string;
    phone: string;
    specialty: string;
    licenseNumber: string;
    hospital: string;
    bio: string;
  }>
): Promise<void> => {
  try {
    const doctorDocRef = doc(db, 'doctors', uid);
    await setDoc(
      doctorDocRef,
      {
        ...updates,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error updating doctor profile:", error);
    throw new Error("Could not update doctor profile.");
  }
};

/**
 * Assigns a patient to a doctor using subcollection.
 * @param doctorId The Firebase Auth UID of the doctor.
 * @param patientId The Firebase Auth UID of the patient.
 * @param notes Optional notes about the relationship.
 * @returns The patient ID.
 */
export const assignPatientToDoctor = async (
  doctorId: string,
  patientId: string,
  notes?: string
): Promise<string> => {
  try {
    // Check if relationship already exists
    const patientDocRef = doc(db, 'doctors', doctorId, 'patients', patientId);
    const patientSnapshot = await getDoc(patientDocRef);

    if (patientSnapshot.exists()) {
      throw new Error("Patient is already assigned to this doctor.");
    }

    // Add patient to doctor's patients subcollection
    await setDoc(patientDocRef, {
      patientId,
      assignedAt: serverTimestamp(),
      notes: notes || null,
    });

    return patientId;
  } catch (error) {
    console.error("Error assigning patient to doctor:", error);
    throw error;
  }
};

/**
 * Removes a patient from a doctor's list (subcollection).
 * @param doctorId The Firebase Auth UID of the doctor.
 * @param patientId The Firebase Auth UID of the patient.
 */
export const removePatientFromDoctor = async (
  doctorId: string,
  patientId: string
): Promise<void> => {
  try {
    const patientDocRef = doc(db, 'doctors', doctorId, 'patients', patientId);
    await deleteDoc(patientDocRef);
  } catch (error) {
    console.error("Error removing patient from doctor:", error);
    throw new Error("Could not remove patient from doctor.");
  }
};

/**
 * Gets all patients assigned to a specific doctor from subcollection.
 * @param doctorId The Firebase Auth UID of the doctor.
 * @returns Array of patient IDs assigned to this doctor.
 */
export const getDoctorPatients = async (doctorId: string): Promise<string[]> => {
  try {
    const patientsRef = collection(db, 'doctors', doctorId, 'patients');
    const querySnapshot = await getDocs(patientsRef);

    return querySnapshot.docs.map(doc => doc.id); // Document ID is the patientId
  } catch (error) {
    console.error("Error fetching doctor's patients:", error);
    throw new Error("Could not fetch doctor's patients.");
  }
};