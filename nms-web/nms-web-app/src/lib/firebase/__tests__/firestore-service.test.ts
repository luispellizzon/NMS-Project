// src/lib/firebase/firestore-service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addPatient } from '../firestore-service';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';

// Mock firebase/firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  serverTimestamp: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
}));

// Mock firebase config
vi.mock('../config', () => ({
  db: {},
}));

describe('firestore-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addPatient', () => {
    it('successfully adds a patient to Firestore', async () => {
      const mockPatientData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        dateOfBirth: '1990-01-15',
        gender: 'Male' as const,
        role: 'patient' as const,
      };

      const mockDocId = 'patient-123';
      const mockDocRef = { id: mockDocId };

      (collection as any).mockReturnValue('mock-collection');
      (addDoc as any).mockResolvedValue(mockDocRef);
      (serverTimestamp as any).mockReturnValue('mock-timestamp');
      (doc as any).mockReturnValue('mock-doc-ref');
      (setDoc as any).mockResolvedValue(undefined);

      const result = await addPatient(mockPatientData);

      expect(collection).toHaveBeenCalledWith({}, 'users');
      expect(addDoc).toHaveBeenCalledWith('mock-collection', {
        ...mockPatientData,
        createdAt: 'mock-timestamp',
      });
      expect(setDoc).toHaveBeenCalledWith('mock-doc-ref', { uid: mockDocId }, { merge: true });
      expect(result).toBe(mockDocId);
    });

    it('adds patient with server timestamp', async () => {
      const mockPatientData = {
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        dateOfBirth: '1985-05-20',
        gender: 'Female' as const,
        role: 'patient' as const,
      };

      const mockDocRef = { id: 'patient-456' };

      (collection as any).mockReturnValue('mock-collection');
      (addDoc as any).mockResolvedValue(mockDocRef);
      (serverTimestamp as any).mockReturnValue('server-timestamp');
      (doc as any).mockReturnValue('mock-doc-ref');
      (setDoc as any).mockResolvedValue(undefined);

      await addPatient(mockPatientData);

      expect(serverTimestamp).toHaveBeenCalled();
      expect(addDoc).toHaveBeenCalledWith('mock-collection', expect.objectContaining({
        createdAt: 'server-timestamp',
      }));
    });

    it('sets uid field on the created document', async () => {
      const mockPatientData = {
        fullName: 'Test User',
        email: 'test@example.com',
        dateOfBirth: '1995-03-10',
        gender: 'Male' as const,
        role: 'patient' as const,
      };

      const mockDocId = 'patient-789';
      const mockDocRef = { id: mockDocId };

      (collection as any).mockReturnValue('mock-collection');
      (addDoc as any).mockResolvedValue(mockDocRef);
      (serverTimestamp as any).mockReturnValue('mock-timestamp');
      (doc as any).mockReturnValue('mock-doc-ref');
      (setDoc as any).mockResolvedValue(undefined);

      await addPatient(mockPatientData);

      expect(doc).toHaveBeenCalledWith({}, 'users', mockDocId);
      expect(setDoc).toHaveBeenCalledWith('mock-doc-ref', { uid: mockDocId }, { merge: true });
    });

    it('throws error when addDoc fails', async () => {
      const mockPatientData = {
        fullName: 'Error Test',
        email: 'error@example.com',
        dateOfBirth: '1980-01-01',
        gender: 'Female' as const,
        role: 'patient' as const,
      };

      (collection as any).mockReturnValue('mock-collection');
      (addDoc as any).mockRejectedValue(new Error('Firestore error'));
      (serverTimestamp as any).mockReturnValue('mock-timestamp');

      await expect(addPatient(mockPatientData)).rejects.toThrow('Could not add patient.');
    });

    it('throws error when setDoc fails', async () => {
      const mockPatientData = {
        fullName: 'SetDoc Error Test',
        email: 'seterror@example.com',
        dateOfBirth: '1992-06-15',
        gender: 'Male' as const,
        role: 'patient' as const,
      };

      const mockDocRef = { id: 'patient-error' };

      (collection as any).mockReturnValue('mock-collection');
      (addDoc as any).mockResolvedValue(mockDocRef);
      (serverTimestamp as any).mockReturnValue('mock-timestamp');
      (doc as any).mockReturnValue('mock-doc-ref');
      (setDoc as any).mockRejectedValue(new Error('SetDoc error'));

      await expect(addPatient(mockPatientData)).rejects.toThrow('Could not add patient.');
    });

    it('returns the document ID of the newly created patient', async () => {
      const mockPatientData = {
        fullName: 'ID Test',
        email: 'idtest@example.com',
        dateOfBirth: '1988-12-25',
        gender: 'Female' as const,
        role: 'patient' as const,
      };

      const expectedId = 'unique-patient-id-123';
      const mockDocRef = { id: expectedId };

      (collection as any).mockReturnValue('mock-collection');
      (addDoc as any).mockResolvedValue(mockDocRef);
      (serverTimestamp as any).mockReturnValue('mock-timestamp');
      (doc as any).mockReturnValue('mock-doc-ref');
      (setDoc as any).mockResolvedValue(undefined);

      const result = await addPatient(mockPatientData);

      expect(result).toBe(expectedId);
    });

    it('passes all patient data to Firestore', async () => {
      const mockPatientData = {
        fullName: 'Complete Data Test',
        email: 'complete@example.com',
        dateOfBirth: '1975-08-30',
        gender: 'Male' as const,
        role: 'patient' as const,
      };

      const mockDocRef = { id: 'patient-complete' };

      (collection as any).mockReturnValue('mock-collection');
      (addDoc as any).mockResolvedValue(mockDocRef);
      (serverTimestamp as any).mockReturnValue('mock-timestamp');
      (doc as any).mockReturnValue('mock-doc-ref');
      (setDoc as any).mockResolvedValue(undefined);

      await addPatient(mockPatientData);

      expect(addDoc).toHaveBeenCalledWith('mock-collection', expect.objectContaining({
        fullName: 'Complete Data Test',
        email: 'complete@example.com',
        dateOfBirth: '1975-08-30',
        gender: 'Male',
        role: 'patient',
      }));
    });
  });
});