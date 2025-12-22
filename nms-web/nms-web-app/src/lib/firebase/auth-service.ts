// lib/firebase/auth-service.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  UserCredential,
  GoogleAuthProvider,
  signInWithPopup,
  OAuthProvider,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
  updateEmail,
} from 'firebase/auth';
import { auth } from './config';
import { getDoctorProfile, createDoctorProfile } from './firestore-service';

// Email/Password Sign Up
export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName: string
): Promise<UserCredential> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  // Update display name
  if (userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
  }

  return userCredential;
};

// Email/Password Sign In
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

/**
 * Ensures a doctor profile exists for the given user.
 * If no profile exists, creates one with the user's info.
 * @param user The authenticated Firebase user.
 */
const ensureDoctorProfile = async (user: User): Promise<void> => {
  try {
    // Check if doctor profile already exists
    const existingProfile = await getDoctorProfile(user.uid);

    if (!existingProfile) {
      // Create doctor profile with available user information
      await createDoctorProfile(user.uid, {
        fullName: user.displayName || 'Doctor',
        email: user.email || '',
        role: 'doctor',
      });
      console.log('Doctor profile created for OAuth user:', user.uid);
    }
  } catch (error) {
    console.error('Error ensuring doctor profile:', error);
    throw new Error('Could not create doctor profile.');
  }
};

// Google Sign In
export const signInWithGoogle = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);

  // Ensure doctor profile exists
  await ensureDoctorProfile(userCredential.user);

  return userCredential.user;
};

// Apple Sign In
export const signInWithApple = async (): Promise<User> => {
  const provider = new OAuthProvider('apple.com');
  provider.addScope('email');
  provider.addScope('name');
  const userCredential = await signInWithPopup(auth, provider);

  // Ensure doctor profile exists
  await ensureDoctorProfile(userCredential.user);

  return userCredential.user;
};

// Sign Out
export const logOut = async (): Promise<void> => {
  await signOut(auth);
};

// Password Reset
export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

// Get Current User
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Sends a password reset email to the specified email address.
 * @param email The user's email address.
 */
export const sendPasswordReset = async (email: string): Promise<void> => {
  return sendPasswordResetEmail(auth, email);
};

/**
 * Updates the user's profile information (display name and photo URL).
 * @param displayName The new display name.
 * @param photoURL The new photo URL.
 */
export const updateUserProfile = async (displayName?: string, photoURL?: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No user is currently signed in.');
  }

  const updates: { displayName?: string; photoURL?: string } = {};
  if (displayName !== undefined) updates.displayName = displayName;
  if (photoURL !== undefined) updates.photoURL = photoURL;

  await updateProfile(user, updates);
};

/**
 * Updates the user's email address.
 * @param newEmail The new email address.
 */
export const updateUserEmail = async (newEmail: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No user is currently signed in.');
  }

  await updateEmail(user, newEmail);
};

/**
 * Changes the user's password.
 * @param currentPassword The current password for re-authentication.
 * @param newPassword The new password.
 */
export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error('No user is currently signed in.');
  }

  // Re-authenticate the user
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);

  // Update password
  await updatePassword(user, newPassword);
};

/**
 * Deletes the current user's account.
 * @param currentPassword The current password for re-authentication (required for email/password users).
 */
export const deleteUserAccount = async (currentPassword?: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No user is currently signed in.');
  }

  // Re-authenticate if password is provided (for email/password users)
  if (currentPassword && user.email) {
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
  }

  // Delete user account
  await deleteUser(user);
};