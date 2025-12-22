// src/lib/firebase/services/__tests__/admin-service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getUserRole,
  getAdminProfile,
  createAdminProfile,
  getAllAdmins,
  getAllDoctors,
  getDoctorById,
  updateDoctorByAdmin,
  deleteDoctorSoft,
  updateAdminProfile,
  deleteAdminSoft,
  getAdminDashboardStats,
} from '../admin-service';
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
} from 'firebase/firestore';

// Mock firebase/firestore
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(() => ({})),
  doc: vi.fn(() => ({})),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn(),
  query: vi.fn(() => ({})),
  where: vi.fn(() => ({})),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
  Timestamp: {
    fromDate: vi.fn(() => ({ toDate: () => new Date() })),
  },
}));

// Mock firebase/auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
}));

// Mock firebase/app
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: vi.fn(() => []),
}));

// Mock firebase/storage
vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({})),
}));

// Mock firebase/functions
vi.mock('firebase/functions', () => ({
  getFunctions: vi.fn(() => ({})),
  connectFunctionsEmulator: vi.fn(),
}));

// Mock firebase config
vi.mock('../config', () => ({
  db: {},
  auth: {},
}));

describe('admin-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserRole', () => {
    it('should return admin role from users collection', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ role: 'admin' }),
      } as any);

      const result = await getUserRole('admin-123');

      expect(doc).toHaveBeenCalledWith({}, 'users', 'admin-123');
      expect(result).toBe('admin');
    });

    it('should return doctor role from users collection', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ role: 'doctor' }),
      } as any);

      const result = await getUserRole('doctor-123');

      expect(result).toBe('doctor');
    });

    it('should return patient role from users collection', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ role: 'patient' }),
      } as any);

      const result = await getUserRole('patient-123');

      expect(result).toBe('patient');
    });

    it('should check doctors collection if user not in users collection', async () => {
      vi.mocked(getDoc)
        .mockResolvedValueOnce({
          exists: () => false,
        } as any)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({}),
        } as any);

      const result = await getUserRole('doctor-123');

      expect(doc).toHaveBeenCalledWith({}, 'doctors', 'doctor-123');
      expect(result).toBe('doctor');
    });

    it('should return null if user not found in any collection', async () => {
      vi.mocked(getDoc)
        .mockResolvedValueOnce({
          exists: () => false,
        } as any)
        .mockResolvedValueOnce({
          exists: () => false,
        } as any);

      const result = await getUserRole('unknown-123');

      expect(result).toBeNull();
    });

    it('should throw error on Firestore failure', async () => {
      vi.mocked(getDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(getUserRole('admin-123')).rejects.toThrow('Could not fetch user role.');
    });
  });

  describe('getAdminProfile', () => {
    it('should return admin profile if exists', async () => {
      const mockData = {
        fullName: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        createdAt: { toDate: () => new Date('2024-01-01') },
        lastLogin: { toDate: () => new Date('2024-06-01') },
        isActive: true,
      };

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: 'admin-123',
        data: () => mockData,
      } as any);

      const result = await getAdminProfile('admin-123');

      expect(doc).toHaveBeenCalledWith({}, 'users', 'admin-123');
      expect(result).toEqual({
        id: 'admin-123',
        fullName: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        createdAt: new Date('2024-01-01'),
        lastLogin: new Date('2024-06-01'),
        isActive: true,
      });
    });

    it('should return null if user is not an admin', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: 'user-123',
        data: () => ({ role: 'doctor' }),
      } as any);

      const result = await getAdminProfile('user-123');

      expect(result).toBeNull();
    });

    it('should return null if user does not exist', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any);

      const result = await getAdminProfile('admin-123');

      expect(result).toBeNull();
    });

    it('should handle missing createdAt with default date', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: 'admin-123',
        data: () => ({
          fullName: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
        }),
      } as any);

      const result = await getAdminProfile('admin-123');

      expect(result?.createdAt).toBeInstanceOf(Date);
    });

    it('should throw error on Firestore failure', async () => {
      vi.mocked(getDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(getAdminProfile('admin-123')).rejects.toThrow('Could not fetch admin profile.');
    });
  });

  describe('createAdminProfile', () => {
    it('should create admin profile and return UID', async () => {
      vi.mocked(setDoc).mockResolvedValue(undefined as any);

      const result = await createAdminProfile('admin-123', {
        fullName: 'New Admin',
        email: 'newadmin@example.com',
      });

      expect(doc).toHaveBeenCalledWith({}, 'users', 'admin-123');
      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          uid: 'admin-123',
          fullName: 'New Admin',
          email: 'newadmin@example.com',
          role: 'admin',
          isActive: true,
          createdAt: 'mock-timestamp',
        })
      );
      expect(result).toBe('admin-123');
    });

    it('should throw error on Firestore failure', async () => {
      vi.mocked(setDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(
        createAdminProfile('admin-123', {
          fullName: 'New Admin',
          email: 'newadmin@example.com',
        })
      ).rejects.toThrow('Could not create admin profile.');
    });
  });

  describe('getAllAdmins', () => {
    it('should return all admins', async () => {
      const mockDocs = [
        {
          id: 'admin-1',
          data: () => ({
            fullName: 'Admin One',
            email: 'admin1@example.com',
            createdAt: { toDate: () => new Date('2024-01-01') },
            lastLogin: { toDate: () => new Date('2024-06-01') },
            isActive: true,
          }),
        },
        {
          id: 'admin-2',
          data: () => ({
            fullName: 'Admin Two',
            email: 'admin2@example.com',
            createdAt: { toDate: () => new Date('2024-02-01') },
            isActive: false,
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValue({
        docs: mockDocs,
      } as any);

      const result = await getAllAdmins();

      expect(collection).toHaveBeenCalledWith({}, 'users');
      expect(query).toHaveBeenCalled();
      expect(where).toHaveBeenCalledWith('role', '==', 'admin');
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'admin-1',
        fullName: 'Admin One',
        email: 'admin1@example.com',
        role: 'admin',
        createdAt: new Date('2024-01-01'),
        lastLogin: new Date('2024-06-01'),
        isActive: true,
      });
    });

    it('should return empty array if no admins', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        docs: [],
      } as any);

      const result = await getAllAdmins();

      expect(result).toEqual([]);
    });

    it('should throw error on Firestore failure', async () => {
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      await expect(getAllAdmins()).rejects.toThrow('Could not fetch admins.');
    });
  });

  describe('getAllDoctors', () => {
    it('should return all doctors with patient counts', async () => {
      const mockDoctorDocs = [
        {
          id: 'doctor-1',
          data: () => ({
            fullName: 'Dr. One',
            email: 'dr1@example.com',
            createdAt: { toDate: () => new Date('2024-01-01') },
            specialty: 'Neurology',
            hospital: 'General Hospital',
            isActive: true,
          }),
        },
      ];

      vi.mocked(getDocs)
        .mockResolvedValueOnce({
          docs: mockDoctorDocs,
        } as any)
        .mockResolvedValueOnce({
          size: 5,
        } as any);

      const result = await getAllDoctors();

      expect(collection).toHaveBeenCalledWith({}, 'doctors');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'doctor-1',
        fullName: 'Dr. One',
        email: 'dr1@example.com',
        role: 'doctor',
        createdAt: new Date('2024-01-01'),
        patientCount: 5,
        specialty: 'Neurology',
        hospital: 'General Hospital',
        isActive: true,
        lastLogin: undefined,
      });
    });

    it('should return empty array if no doctors', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        docs: [],
      } as any);

      const result = await getAllDoctors();

      expect(result).toEqual([]);
    });

    it('should throw error on Firestore failure', async () => {
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      await expect(getAllDoctors()).rejects.toThrow('Could not fetch doctors.');
    });
  });

  describe('getDoctorById', () => {
    it('should return doctor profile if exists', async () => {
      const mockData = {
        fullName: 'Dr. Smith',
        email: 'drsmith@example.com',
        role: 'doctor',
        createdAt: { toDate: () => new Date('2024-01-01') },
      };

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: 'doctor-123',
        data: () => mockData,
      } as any);

      const result = await getDoctorById('doctor-123');

      expect(doc).toHaveBeenCalledWith({}, 'doctors', 'doctor-123');
      expect(result).toEqual({
        id: 'doctor-123',
        fullName: 'Dr. Smith',
        email: 'drsmith@example.com',
        role: 'doctor',
        createdAt: new Date('2024-01-01'),
      });
    });

    it('should return null if doctor does not exist', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any);

      const result = await getDoctorById('doctor-123');

      expect(result).toBeNull();
    });

    it('should throw error on Firestore failure', async () => {
      vi.mocked(getDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(getDoctorById('doctor-123')).rejects.toThrow('Could not fetch doctor.');
    });
  });

  describe('updateDoctorByAdmin', () => {
    it('should update doctor with provided fields', async () => {
      vi.mocked(updateDoc).mockResolvedValue(undefined as any);

      await updateDoctorByAdmin('doctor-123', {
        fullName: 'Dr. Smith Updated',
        specialty: 'Cardiology',
      });

      expect(doc).toHaveBeenCalledWith({}, 'doctors', 'doctor-123');
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          fullName: 'Dr. Smith Updated',
          specialty: 'Cardiology',
          updatedAt: 'mock-timestamp',
        })
      );
    });

    it('should throw error on Firestore failure', async () => {
      vi.mocked(updateDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(
        updateDoctorByAdmin('doctor-123', { fullName: 'Updated' })
      ).rejects.toThrow('Could not update doctor.');
    });
  });

  describe('deleteDoctorSoft', () => {
    it('should soft delete doctor by setting isActive to false', async () => {
      vi.mocked(updateDoc).mockResolvedValue(undefined as any);

      await deleteDoctorSoft('doctor-123');

      expect(doc).toHaveBeenCalledWith({}, 'doctors', 'doctor-123');
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          isActive: false,
          deletedAt: 'mock-timestamp',
        })
      );
    });

    it('should throw error on Firestore failure', async () => {
      vi.mocked(updateDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(deleteDoctorSoft('doctor-123')).rejects.toThrow('Could not delete doctor.');
    });
  });

  describe('updateAdminProfile', () => {
    it('should update admin profile with provided fields', async () => {
      vi.mocked(updateDoc).mockResolvedValue(undefined as any);

      await updateAdminProfile('admin-123', {
        fullName: 'Updated Admin',
        isActive: true,
      });

      expect(doc).toHaveBeenCalledWith({}, 'users', 'admin-123');
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          fullName: 'Updated Admin',
          isActive: true,
          updatedAt: 'mock-timestamp',
        })
      );
    });

    it('should throw error on Firestore failure', async () => {
      vi.mocked(updateDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(
        updateAdminProfile('admin-123', { fullName: 'Updated' })
      ).rejects.toThrow('Could not update admin.');
    });
  });

  describe('deleteAdminSoft', () => {
    it('should soft delete admin by setting isActive to false', async () => {
      vi.mocked(updateDoc).mockResolvedValue(undefined as any);

      await deleteAdminSoft('admin-123');

      expect(doc).toHaveBeenCalledWith({}, 'users', 'admin-123');
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          isActive: false,
          deletedAt: 'mock-timestamp',
        })
      );
    });

    it('should throw error on Firestore failure', async () => {
      vi.mocked(updateDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(deleteAdminSoft('admin-123')).rejects.toThrow('Could not delete admin.');
    });
  });

  describe('getAdminDashboardStats', () => {
    it('should return aggregated dashboard statistics', async () => {
      // Mock getDocs responses for each collection query
      vi.mocked(getDocs)
        .mockResolvedValueOnce({ size: 10 } as any) // doctors
        .mockResolvedValueOnce({ size: 3 } as any)  // admins
        .mockResolvedValueOnce({
          size: 50,
          forEach: (cb: (doc: any) => void) => {
            cb({ data: () => ({ createdAt: { toDate: () => new Date() } }) });
          },
        } as any) // patients
        .mockResolvedValueOnce({ size: 100 } as any) // assessments
        .mockResolvedValueOnce({
          forEach: (cb: (doc: any) => void) => {
            cb({ data: () => ({ rating: 4 }) });
            cb({ data: () => ({ rating: 5 }) });
          },
        } as any) // feedback
        .mockResolvedValueOnce({ size: 5 } as any); // open support requests

      const result = await getAdminDashboardStats();

      expect(result.totalDoctors).toBe(10);
      expect(result.totalPatients).toBe(50);
      expect(result.totalAdmins).toBe(3);
      expect(result.totalAssessments).toBe(100);
      expect(result.averageRating).toBe(4.5);
      expect(result.feedbackCount).toBe(2);
      expect(result.openSupportRequests).toBe(5);
      // newPatientsThisMonth depends on date comparison, just check it's a number
      expect(typeof result.newPatientsThisMonth).toBe('number');
    });

    it('should return zero values when collections are empty', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        size: 0,
        forEach: () => {},
      } as any);

      const result = await getAdminDashboardStats();

      expect(result.totalDoctors).toBe(0);
      expect(result.averageRating).toBe(0);
    });

    it('should throw error on Firestore failure', async () => {
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      await expect(getAdminDashboardStats()).rejects.toThrow(
        'Could not fetch dashboard statistics.'
      );
    });
  });
});
