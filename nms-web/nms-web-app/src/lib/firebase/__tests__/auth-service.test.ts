// src/lib/firebase/auth-service.test.ts

import { describe, it, expect, vi, Mock, beforeEach } from 'vitest';
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signInWithApple,
  logOut,
  resetPassword,
  getCurrentUser,
} from '../auth-service';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  OAuthProvider,
  signOut,
  sendPasswordResetEmail,
  User,
  UserCredential,
} from 'firebase/auth';
import { auth } from '../config';
import { getDoctorProfile, createDoctorProfile } from '../firestore-service';

// Mock the entire firebase/auth module
vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),

  GoogleAuthProvider: vi.fn(),
  OAuthProvider: vi.fn(() => ({ addScope: vi.fn() })),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}));

// Mock the auth object from config
vi.mock('../config', () => ({
  auth: { currentUser: null }, // Start with no user logged in
}));

// Mock firestore-service to handle doctor profile operations
vi.mock('../firestore-service', () => ({
  getDoctorProfile: vi.fn(),
  createDoctorProfile: vi.fn(),
}));

// Cast mocks to their correct types for intellisense and control
const createUserWithEmailAndPasswordMock = createUserWithEmailAndPassword as Mock;
const signInWithEmailAndPasswordMock = signInWithEmailAndPassword as Mock;
const updateProfileMock = updateProfile as Mock;
const signInWithPopupMock = signInWithPopup as Mock;
const getDoctorProfileMock = getDoctorProfile as Mock;
const createDoctorProfileMock = createDoctorProfile as Mock;

describe('Auth Service', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signUpWithEmail', () => {
    it('should create a user, update their profile, and return the user credential', async () => {
      const mockUser = { uid: 'new-user-123' } as User;
      const mockUserCredential = { user: mockUser } as UserCredential;

      createUserWithEmailAndPasswordMock.mockResolvedValue(mockUserCredential);
      updateProfileMock.mockResolvedValue(undefined);

      const email = 'test@example.com';
      const password = 'password123';
      const displayName = 'Test User';

      const userCredential = await signUpWithEmail(email, password, displayName);

      // Verify user creation was called correctly
      expect(createUserWithEmailAndPasswordMock).toHaveBeenCalledWith(auth, email, password);
      // Verify profile update was called correctly
      expect(updateProfileMock).toHaveBeenCalledWith(mockUser, { displayName });
      // Verify the correct user credential object was returned
      expect(userCredential).toEqual(mockUserCredential);
    });
  });

  describe('signInWithEmail', () => {
    it('should sign in the user and return the user object', async () => {
      const mockUser = { uid: 'existing-user-456' } as User;
      const mockUserCredential = { user: mockUser } as UserCredential;

      signInWithEmailAndPasswordMock.mockResolvedValue(mockUserCredential);

      const email = 'user@example.com';
      const password = 'password123';

      const user = await signInWithEmail(email, password);

      // Verify sign in was called correctly
      expect(signInWithEmailAndPasswordMock).toHaveBeenCalledWith(auth, email, password);
      // Verify the correct user object was returned
      expect(user).toEqual(mockUser);
    });
  });

  describe('signInWithGoogle', () => {
    it('should call signInWithPopup with a GoogleAuthProvider and return the user', async () => {
      const mockUser = { uid: 'google-user-123', displayName: 'Google User', email: 'google@example.com' } as User;
      signInWithPopupMock.mockResolvedValue({ user: mockUser });

      // Mock getDoctorProfile to return null (profile doesn't exist)
      getDoctorProfileMock.mockResolvedValue(null);
      // Mock createDoctorProfile to succeed
      createDoctorProfileMock.mockResolvedValue('google-user-123');

      const user = await signInWithGoogle();

      expect(GoogleAuthProvider).toHaveBeenCalled();
      expect(signInWithPopup).toHaveBeenCalledWith(auth, expect.any(GoogleAuthProvider));

      // Verify doctor profile creation was attempted
      expect(getDoctorProfileMock).toHaveBeenCalledWith('google-user-123');
      expect(createDoctorProfileMock).toHaveBeenCalledWith('google-user-123', {
        fullName: 'Google User',
        email: 'google@example.com',
        role: 'doctor',
      });

      expect(user).toEqual(mockUser);
    });
  });

  describe('signInWithApple', () => {
    it('should call signInWithPopup with an OAuthProvider and return the user', async () => {
      const mockUser = { uid: 'apple-user-456', displayName: 'Apple User', email: 'apple@example.com' } as User;
      const mockProvider = { addScope: vi.fn() };
      (OAuthProvider as unknown as Mock).mockReturnValue(mockProvider);
      signInWithPopupMock.mockResolvedValue({ user: mockUser });

      // Mock getDoctorProfile to return null (profile doesn't exist)
      getDoctorProfileMock.mockResolvedValue(null);
      // Mock createDoctorProfile to succeed
      createDoctorProfileMock.mockResolvedValue('apple-user-456');

      const user = await signInWithApple();

      expect(OAuthProvider).toHaveBeenCalledWith('apple.com');
      expect(mockProvider.addScope).toHaveBeenCalledWith('email');
      expect(mockProvider.addScope).toHaveBeenCalledWith('name');
      expect(signInWithPopup).toHaveBeenCalledWith(auth, mockProvider);

      // Verify doctor profile creation was attempted
      expect(getDoctorProfileMock).toHaveBeenCalledWith('apple-user-456');
      expect(createDoctorProfileMock).toHaveBeenCalledWith('apple-user-456', {
        fullName: 'Apple User',
        email: 'apple@example.com',
        role: 'doctor',
      });

      expect(user).toEqual(mockUser);
    });
  });

  describe('logOut', () => {
    it('should call the signOut function from firebase/auth', async () => {
      await logOut();
      expect(signOut).toHaveBeenCalledWith(auth);
    });
  });

  describe('resetPassword', () => {
    it('should call sendPasswordResetEmail with the provided email', async () => {
      const testEmail = 'reset@example.com';
      await resetPassword(testEmail);
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(auth, testEmail);
    });
  });

  describe('getCurrentUser', () => {
    it('should return the currentUser from the auth object', () => {
      const mockUser = { uid: 'current-user-789' } as User;
      vi.spyOn(auth, 'currentUser', 'get').mockReturnValue(mockUser);


      const user = getCurrentUser();

      expect(user).toEqual(mockUser);
    });

    it('should return null if no user is signed in', () => {
      vi.spyOn(auth, 'currentUser', 'get').mockReturnValue(null);
      const user = getCurrentUser();
      expect(user).toBeNull();
    });
  });
});