// src/lib/firebase/firestore-service.ts
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { db } from './config';
import { Patient } from '@/types/patient';

// Define the shape of the data we'll send to Firestore
// This excludes fields that will be generated automatically
type NewPatientData = {
  fullName: string;
  email: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
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