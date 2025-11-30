// src/lib/firebase/services/__tests__/doctor-service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createDoctorProfile,
  getDoctorProfile,
  updateDoctorProfile,
  assignPatientToDoctor,
  removePatientFromDoctor,
  getDoctorPatients,
} from '../doctor-service';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';

// Mock firebase/firestore
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(() => ({})),
  doc: vi.fn(() => ({})),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  deleteDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
}));

// Mock firebase config
vi.mock('../config', () => ({
  db: {},
}));

describe('doctor-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createDoctorProfile', () => {
    it('should create a new doctor profile and return the UID', async () => {
      const doctorData = {
        fullName: 'Dr. Jane Smith',
        email: 'jane@hospital.com',
        role: 'doctor' as const,
      };

      vi.mocked(setDoc).mockResolvedValue(undefined as any);

      const result = await createDoctorProfile('doctor-123', doctorData);

      expect(doc).toHaveBeenCalledWith({}, 'doctors', 'doctor-123');
      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ...doctorData,
          id: 'doctor-123',
          createdAt: 'mock-timestamp',
        })
      );
      expect(result).toBe('doctor-123');
    });

    it('should throw an error if setDoc fails', async () => {
      const doctorData = {
        fullName: 'Dr. Jane Smith',
        email: 'jane@hospital.com',
        role: 'doctor' as const,
      };

      vi.mocked(setDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(createDoctorProfile('doctor-123', doctorData)).rejects.toThrow(
        'Could not create doctor profile.'
      );
    });
  });

  describe('getDoctorProfile', () => {
    it('should return doctor profile if it exists', async () => {
      const mockData = {
        fullName: 'Dr. Jane Smith',
        email: 'jane@hospital.com',
        role: 'doctor',
        createdAt: { toDate: () => new Date('2024-01-01') },
      };

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: 'doctor-123',
        data: () => mockData,
      } as any);

      const result = await getDoctorProfile('doctor-123');

      expect(doc).toHaveBeenCalledWith({}, 'doctors', 'doctor-123');
      expect(result).toEqual({
        id: 'doctor-123',
        fullName: 'Dr. Jane Smith',
        email: 'jane@hospital.com',
        role: 'doctor',
        createdAt: new Date('2024-01-01'),
      });
    });

    it('should return null if doctor does not exist', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any);

      const result = await getDoctorProfile('doctor-123');

      expect(result).toBeNull();
    });

    it('should handle missing createdAt with default date', async () => {
      const mockData = {
        fullName: 'Dr. Jane Smith',
        email: 'jane@hospital.com',
        role: 'doctor',
      };

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: 'doctor-123',
        data: () => mockData,
      } as any);

      const result = await getDoctorProfile('doctor-123');

      expect(result?.createdAt).toBeInstanceOf(Date);
    });

    it('should throw an error if getDoc fails', async () => {
      vi.mocked(getDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(getDoctorProfile('doctor-123')).rejects.toThrow(
        'Could not fetch doctor profile.'
      );
    });
  });

  describe('updateDoctorProfile', () => {
    it('should update doctor profile with provided fields', async () => {
      const updates = {
        fullName: 'Dr. Jane Smith-Jones',
        phone: '+1234567890',
        specialty: 'Neurology',
      };

      vi.mocked(setDoc).mockResolvedValue(undefined as any);

      await updateDoctorProfile('doctor-123', updates);

      expect(doc).toHaveBeenCalledWith({}, 'doctors', 'doctor-123');
      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ...updates,
          updatedAt: 'mock-timestamp',
        }),
        { merge: true }
      );
    });

    it('should update profile with all optional fields', async () => {
      const updates = {
        fullName: 'Dr. Jane Smith',
        phone: '+1234567890',
        specialty: 'Neurology',
        licenseNumber: 'LIC-12345',
        hospital: 'General Hospital',
        bio: 'Experienced neurologist',
      };

      vi.mocked(setDoc).mockResolvedValue(undefined as any);

      await updateDoctorProfile('doctor-123', updates);

      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining(updates),
        { merge: true }
      );
    });

    it('should throw an error if setDoc fails', async () => {
      const updates = { fullName: 'Dr. Jane Smith' };

      vi.mocked(setDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(updateDoctorProfile('doctor-123', updates)).rejects.toThrow(
        'Could not update doctor profile.'
      );
    });
  });

  describe('assignPatientToDoctor', () => {
    it('should assign a patient to a doctor', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any);
      vi.mocked(setDoc).mockResolvedValue(undefined as any);

      const result = await assignPatientToDoctor('doctor-123', 'patient-456', 'High risk patient');

      expect(doc).toHaveBeenCalledWith({}, 'doctors', 'doctor-123', 'patients', 'patient-456');
      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          patientId: 'patient-456',
          assignedAt: 'mock-timestamp',
          notes: 'High risk patient',
        })
      );
      expect(result).toBe('patient-456');
    });

    it('should handle assignment without notes', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any);
      vi.mocked(setDoc).mockResolvedValue(undefined as any);

      await assignPatientToDoctor('doctor-123', 'patient-456');

      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          notes: null,
        })
      );
    });

    it('should throw an error if patient is already assigned', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
      } as any);

      await expect(assignPatientToDoctor('doctor-123', 'patient-456')).rejects.toThrow(
        'Patient is already assigned to this doctor.'
      );
    });

    it('should throw an error if assignment fails', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any);
      vi.mocked(setDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(assignPatientToDoctor('doctor-123', 'patient-456')).rejects.toThrow();
    });
  });

  describe('removePatientFromDoctor', () => {
    it('should remove a patient from doctor', async () => {
      vi.mocked(deleteDoc).mockResolvedValue(undefined as any);

      await removePatientFromDoctor('doctor-123', 'patient-456');

      expect(doc).toHaveBeenCalledWith({}, 'doctors', 'doctor-123', 'patients', 'patient-456');
      expect(deleteDoc).toHaveBeenCalled();
    });

    it('should throw an error if deletion fails', async () => {
      vi.mocked(deleteDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(removePatientFromDoctor('doctor-123', 'patient-456')).rejects.toThrow(
        'Could not remove patient from doctor.'
      );
    });
  });

  describe('getDoctorPatients', () => {
    it('should return array of patient IDs', async () => {
      const mockDocs = [
        { id: 'patient-1' },
        { id: 'patient-2' },
        { id: 'patient-3' },
      ];

      vi.mocked(getDocs).mockResolvedValue({
        docs: mockDocs,
      } as any);

      const result = await getDoctorPatients('doctor-123');

      expect(collection).toHaveBeenCalledWith({}, 'doctors', 'doctor-123', 'patients');
      expect(result).toEqual(['patient-1', 'patient-2', 'patient-3']);
    });

    it('should return empty array if no patients assigned', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        docs: [],
      } as any);

      const result = await getDoctorPatients('doctor-123');

      expect(result).toEqual([]);
    });

    it('should throw an error if getDocs fails', async () => {
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      await expect(getDoctorPatients('doctor-123')).rejects.toThrow(
        "Could not fetch doctor's patients."
      );
    });
  });
});