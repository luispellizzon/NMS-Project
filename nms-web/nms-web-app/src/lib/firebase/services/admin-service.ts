// src/lib/firebase/services/admin-service.ts

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  getAuth,
  signOut,
} from 'firebase/auth';
import { initializeApp, deleteApp } from 'firebase/app';
import { db, auth, firebaseConfig } from '../config';
import {
  UserRole,
  Admin,
  NewAdminData,
  DoctorWithStats,
  AdminDashboardStats,
} from '@/types/admin';
import { Doctor, NewDoctorData } from '@/types/doctor';

/**
 * Gets the role of a user from Firestore.
 * @param uid The Firebase Auth UID of the user.
 * @returns The user's role or null if not found.
 */
export const getUserRole = async (uid: string): Promise<UserRole | null> => {
  try {
    // First check the users collection
    const userDocRef = doc(db, 'users', uid);
    const userSnapshot = await getDoc(userDocRef);

    if (userSnapshot.exists()) {
      const data = userSnapshot.data();
      if (data.role === 'admin' || data.role === 'patient' || data.role === 'doctor') {
        return data.role as UserRole;
      }
    }

    // Check the doctors collection
    const doctorDocRef = doc(db, 'doctors', uid);
    const doctorSnapshot = await getDoc(doctorDocRef);

    if (doctorSnapshot.exists()) {
      return 'doctor';
    }

    return null;
  } catch (error) {
    console.error('Error fetching user role:', error);
    throw new Error('Could not fetch user role.');
  }
};

/**
 * Gets an admin's profile by their UID.
 * @param uid The Firebase Auth UID of the admin.
 * @returns The admin's profile or null if not found.
 */
export const getAdminProfile = async (uid: string): Promise<Admin | null> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userSnapshot = await getDoc(userDocRef);

    if (userSnapshot.exists()) {
      const data = userSnapshot.data();
      if (data.role === 'admin') {
        return {
          id: userSnapshot.id,
          fullName: data.fullName,
          email: data.email,
          role: 'admin',
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLogin: data.lastLogin?.toDate(),
          isActive: data.isActive ?? true,
        } as Admin;
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    throw new Error('Could not fetch admin profile.');
  }
};

/**
 * Creates a new admin profile in the users collection.
 * Note: Firebase Auth user should be created first via createAdminWithAuth.
 * @param uid The Firebase Auth UID of the admin.
 * @param data The admin's profile data.
 * @returns The admin's UID.
 */
export const createAdminProfile = async (
  uid: string,
  data: { fullName: string; email: string }
): Promise<string> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, {
      uid,
      fullName: data.fullName,
      email: data.email,
      role: 'admin',
      isActive: true,
      createdAt: serverTimestamp(),
    });
    return uid;
  } catch (error) {
    console.error('Error creating admin profile:', error);
    throw new Error('Could not create admin profile.');
  }
};

/**
 * Creates a new admin user with Firebase Auth and Firestore profile.
 * Uses a secondary Firebase app instance to avoid signing out the current admin.
 * @param data The admin's data including password.
 * @returns The new admin's UID.
 */
export const createAdminWithAuth = async (data: NewAdminData): Promise<string> => {
  // Create a secondary Firebase app instance to create the user
  // This prevents the current admin from being signed out
  const secondaryApp = initializeApp(firebaseConfig, 'SecondaryApp');
  const secondaryAuth = getAuth(secondaryApp);

  try {
    // Create Firebase Auth user using secondary app
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
      data.email,
      data.password
    );

    // Update display name
    await updateProfile(userCredential.user, {
      displayName: data.fullName,
    });

    // Create Firestore profile
    await createAdminProfile(userCredential.user.uid, {
      fullName: data.fullName,
      email: data.email,
    });

    // Sign out from secondary app and clean up
    await signOut(secondaryAuth);
    await deleteApp(secondaryApp);

    return userCredential.user.uid;
  } catch (error) {
    // Clean up secondary app on error
    try {
      await deleteApp(secondaryApp);
    } catch {
      // Ignore cleanup errors
    }
    console.error('Error creating admin with auth:', error);
    throw error;
  }
};

/**
 * Gets all admins from the users collection.
 * @returns Array of admin profiles.
 */
export const getAllAdmins = async (): Promise<Admin[]> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', 'admin'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        fullName: data.fullName,
        email: data.email,
        role: 'admin' as const,
        createdAt: data.createdAt?.toDate() || new Date(),
        lastLogin: data.lastLogin?.toDate(),
        isActive: data.isActive ?? true,
      };
    });
  } catch (error) {
    console.error('Error fetching all admins:', error);
    throw new Error('Could not fetch admins.');
  }
};

/**
 * Gets all doctors with their patient counts.
 * @returns Array of doctors with statistics.
 */
export const getAllDoctors = async (): Promise<DoctorWithStats[]> => {
  try {
    const doctorsRef = collection(db, 'doctors');
    const querySnapshot = await getDocs(doctorsRef);

    const doctorsWithStats: DoctorWithStats[] = await Promise.all(
      querySnapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();

        // Count patients in subcollection
        const patientsRef = collection(db, 'doctors', docSnapshot.id, 'patients');
        const patientsSnapshot = await getDocs(patientsRef);
        const patientCount = patientsSnapshot.size;

        return {
          id: docSnapshot.id,
          fullName: data.fullName,
          email: data.email,
          role: 'doctor' as const,
          createdAt: data.createdAt?.toDate() || new Date(),
          patientCount,
          lastLogin: data.lastLogin?.toDate(),
          isActive: data.isActive ?? true,
          specialty: data.specialty,
          hospital: data.hospital,
        };
      })
    );

    return doctorsWithStats;
  } catch (error) {
    console.error('Error fetching all doctors:', error);
    throw new Error('Could not fetch doctors.');
  }
};

/**
 * Gets a doctor's profile by their UID.
 * @param doctorId The Firebase Auth UID of the doctor.
 * @returns The doctor's profile or null if not found.
 */
export const getDoctorById = async (doctorId: string): Promise<Doctor | null> => {
  try {
    const doctorDocRef = doc(db, 'doctors', doctorId);
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
    console.error('Error fetching doctor by ID:', error);
    throw new Error('Could not fetch doctor.');
  }
};

/**
 * Creates a new doctor with Firebase Auth and Firestore profile.
 * Uses a secondary Firebase app instance to avoid signing out the current admin.
 * @param data The doctor's data including password.
 * @returns The new doctor's UID.
 */
export const createDoctorWithAuth = async (
  data: NewDoctorData & { password: string }
): Promise<string> => {
  // Create a secondary Firebase app instance to create the user
  // This prevents the current admin from being signed out
  const secondaryApp = initializeApp(firebaseConfig, 'SecondaryApp');
  const secondaryAuth = getAuth(secondaryApp);

  try {
    // Create Firebase Auth user using secondary app
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
      data.email,
      data.password
    );

    // Update display name
    await updateProfile(userCredential.user, {
      displayName: data.fullName,
    });

    // Create Firestore profile in doctors collection
    const doctorDocRef = doc(db, 'doctors', userCredential.user.uid);
    await setDoc(doctorDocRef, {
      id: userCredential.user.uid,
      fullName: data.fullName,
      email: data.email,
      role: 'doctor',
      isActive: true,
      createdAt: serverTimestamp(),
    });

    // Sign out from secondary app and clean up
    await signOut(secondaryAuth);
    await deleteApp(secondaryApp);

    return userCredential.user.uid;
  } catch (error) {
    // Clean up secondary app on error
    try {
      await deleteApp(secondaryApp);
    } catch {
      // Ignore cleanup errors
    }
    console.error('Error creating doctor with auth:', error);
    throw error;
  }
};

/**
 * Updates a doctor's profile information.
 * @param doctorId The Firebase Auth UID of the doctor.
 * @param updates The fields to update.
 */
export const updateDoctorByAdmin = async (
  doctorId: string,
  updates: Partial<{
    fullName: string;
    email: string;
    phone: string;
    specialty: string;
    licenseNumber: string;
    hospital: string;
    bio: string;
    isActive: boolean;
  }>
): Promise<void> => {
  try {
    const doctorDocRef = doc(db, 'doctors', doctorId);
    await updateDoc(doctorDocRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating doctor:', error);
    throw new Error('Could not update doctor.');
  }
};

/**
 * Soft deletes a doctor by setting isActive to false.
 * @param doctorId The Firebase Auth UID of the doctor.
 */
export const deleteDoctorSoft = async (doctorId: string): Promise<void> => {
  try {
    const doctorDocRef = doc(db, 'doctors', doctorId);
    await updateDoc(doctorDocRef, {
      isActive: false,
      deletedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error soft deleting doctor:', error);
    throw new Error('Could not delete doctor.');
  }
};

/**
 * Updates an admin's profile information.
 * @param adminId The Firebase Auth UID of the admin.
 * @param updates The fields to update.
 */
export const updateAdminProfile = async (
  adminId: string,
  updates: Partial<{
    fullName: string;
    email: string;
    isActive: boolean;
  }>
): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', adminId);
    await updateDoc(userDocRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating admin:', error);
    throw new Error('Could not update admin.');
  }
};

/**
 * Soft deletes an admin by setting isActive to false.
 * @param adminId The Firebase Auth UID of the admin.
 */
export const deleteAdminSoft = async (adminId: string): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', adminId);
    await updateDoc(userDocRef, {
      isActive: false,
      deletedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error soft deleting admin:', error);
    throw new Error('Could not delete admin.');
  }
};

/**
 * Gets aggregated statistics for the admin dashboard.
 * @returns Dashboard statistics.
 */
export const getAdminDashboardStats = async (): Promise<AdminDashboardStats> => {
  try {
    // Count doctors
    const doctorsRef = collection(db, 'doctors');
    const doctorsSnapshot = await getDocs(doctorsRef);
    const totalDoctors = doctorsSnapshot.size;

    // Count admins
    const usersRef = collection(db, 'users');
    const adminsQuery = query(usersRef, where('role', '==', 'admin'));
    const adminsSnapshot = await getDocs(adminsQuery);
    const totalAdmins = adminsSnapshot.size;

    // Count patients
    const patientsQuery = query(usersRef, where('role', '==', 'patient'));
    const patientsSnapshot = await getDocs(patientsQuery);
    const totalPatients = patientsSnapshot.size;

    // Count assessments
    const assessmentsRef = collection(db, 'risk_assessments');
    const assessmentsSnapshot = await getDocs(assessmentsRef);
    const totalAssessments = assessmentsSnapshot.size;

    // Calculate average rating from feedback
    const feedbackRef = collection(db, 'feedback');
    const feedbackSnapshot = await getDocs(feedbackRef);
    let totalRating = 0;
    let feedbackCount = 0;
    feedbackSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.rating) {
        totalRating += data.rating;
        feedbackCount++;
      }
    });
    const averageRating = feedbackCount > 0 ? totalRating / feedbackCount : 0;

    // Count open support requests
    const supportRef = collection(db, 'support_requests');
    const openSupportQuery = query(supportRef, where('status', '==', 'open'));
    const openSupportSnapshot = await getDocs(openSupportQuery);
    const openSupportRequests = openSupportSnapshot.size;

    // Count new patients this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfMonthTimestamp = Timestamp.fromDate(startOfMonth);

    let newPatientsThisMonth = 0;
    patientsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.createdAt && data.createdAt.toDate() >= startOfMonth) {
        newPatientsThisMonth++;
      }
    });

    return {
      totalDoctors,
      totalPatients,
      totalAdmins,
      totalAssessments,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      feedbackCount,
      openSupportRequests,
      newPatientsThisMonth,
    };
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    throw new Error('Could not fetch dashboard statistics.');
  }
};
