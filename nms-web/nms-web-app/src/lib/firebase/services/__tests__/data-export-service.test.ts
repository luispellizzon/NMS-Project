// src/lib/firebase/services/__tests__/data-export-service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  exportAllData,
  generateCSV,
  generateJSON,
  getFormattedExport,
} from '../data-export-service';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { ExportedDataRecord } from '@/types/admin';

// Mock firebase/firestore
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(() => ({})),
  doc: vi.fn(() => ({})),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(() => ({})),
  where: vi.fn(() => ({})),
}));

// Mock firebase config
vi.mock('../config', () => ({
  db: {},
}));

describe('data-export-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('exportAllData', () => {
    it('should export data for all doctors and patients', async () => {
      // Mock doctors collection
      const mockDoctorDocs = [
        {
          id: 'doctor-1',
          data: () => ({
            fullName: 'Dr. Smith',
            email: 'drsmith@example.com',
          }),
        },
      ];

      // Mock patients subcollection
      const mockPatientDocs = [
        { id: 'patient-1' },
        { id: 'patient-2' },
      ];

      // Mock user data
      const mockUserData = {
        fullName: 'Patient One',
        email: 'patient1@example.com',
        dateOfBirth: '1990-01-15',
        gender: 'male',
        riskScore: 75,
        riskLevel: 'moderate',
      };

      vi.mocked(getDocs)
        .mockResolvedValueOnce({ docs: mockDoctorDocs } as any) // doctors query
        .mockResolvedValueOnce({ docs: mockPatientDocs } as any); // patients subcollection

      vi.mocked(getDoc)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => mockUserData,
        } as any) // patient 1 user data
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({ riskScore: 75 }),
        } as any) // patient 1 assessment
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({ fullName: 'Patient Two', email: 'patient2@example.com' }),
        } as any) // patient 2 user data
        .mockResolvedValueOnce({
          exists: () => false,
        } as any); // patient 2 assessment

      const result = await exportAllData({
        format: 'json',
        includePatients: true,
        includeRiskAssessments: true,
      });

      expect(result.success).toBe(true);
      expect(result.totalDoctors).toBe(1);
      expect(result.totalPatients).toBe(2);
      expect(result.data).toHaveLength(2);
    });

    it('should filter by specific doctor IDs', async () => {
      // When doctorIds is specified, the code makes two getDocs calls:
      // 1. The chunk query with 'in' filter
      // 2. The fallback fetch all doctors query (for simplicity in implementation)
      // Then for each matching doctor, it fetches patients subcollection
      const mockDoctorDocs = [
        {
          id: 'doctor-1',
          data: () => ({ fullName: 'Dr. One', email: 'dr1@example.com' }),
        },
        {
          id: 'doctor-2',
          data: () => ({ fullName: 'Dr. Two', email: 'dr2@example.com' }),
        },
      ];

      vi.mocked(getDocs)
        .mockResolvedValueOnce({ docs: [] } as any) // chunk query (not used)
        .mockResolvedValueOnce({ docs: mockDoctorDocs } as any) // all doctors fetch
        .mockResolvedValueOnce({ docs: [] } as any); // patients for doctor-1

      const result = await exportAllData({
        format: 'json',
        doctorIds: ['doctor-1'],
        includePatients: true,
      });

      expect(result.success).toBe(true);
      expect(result.totalDoctors).toBe(1); // Only doctor-1 should be counted
    });

    it('should not include patients when includePatients is false', async () => {
      const mockDoctorDocs = [
        {
          id: 'doctor-1',
          data: () => ({ fullName: 'Dr. Smith', email: 'dr@example.com' }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValueOnce({ docs: mockDoctorDocs } as any);

      const result = await exportAllData({
        format: 'json',
        includePatients: false,
      });

      expect(result.success).toBe(true);
      expect(result.totalDoctors).toBe(1);
      expect(result.totalPatients).toBe(0);
      expect(result.data).toHaveLength(0);
    });

    it('should return error result on failure', async () => {
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      const result = await exportAllData({
        format: 'json',
        includePatients: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Firestore error');
      expect(result.totalDoctors).toBe(0);
    });

    it('should skip patients that do not exist in users collection', async () => {
      const mockDoctorDocs = [
        {
          id: 'doctor-1',
          data: () => ({ fullName: 'Dr. Smith', email: 'dr@example.com' }),
        },
      ];

      vi.mocked(getDocs)
        .mockResolvedValueOnce({ docs: mockDoctorDocs } as any)
        .mockResolvedValueOnce({ docs: [{ id: 'nonexistent-patient' }] } as any);

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any);

      const result = await exportAllData({
        format: 'json',
        includePatients: true,
      });

      expect(result.success).toBe(true);
      expect(result.totalPatients).toBe(0);
    });
  });

  describe('generateCSV', () => {
    it('should generate CSV with headers and data', () => {
      const data: ExportedDataRecord[] = [
        {
          doctorId: 'doc-1',
          doctorName: 'Dr. Smith',
          doctorEmail: 'drsmith@example.com',
          patientId: 'patient-1',
          patientName: 'John Doe',
          patientEmail: 'john@example.com',
          patientAge: 65,
          patientGender: 'male',
          riskScore: 75,
          riskLevel: 'moderate',
          mmseScore: 24,
          assessmentDate: '2024-06-01',
        },
      ];

      const csv = generateCSV(data);

      expect(csv).toContain('Doctor ID,Doctor Name,Doctor Email');
      expect(csv).toContain('doc-1,Dr. Smith,drsmith@example.com');
      expect(csv).toContain('John Doe');
      expect(csv).toContain('75');
      expect(csv).toContain('moderate');
    });

    it('should return empty string for empty data', () => {
      const csv = generateCSV([]);

      expect(csv).toBe('');
    });

    it('should escape values with commas', () => {
      const data: ExportedDataRecord[] = [
        {
          doctorId: 'doc-1',
          doctorName: 'Dr. Smith, Jr.',
          doctorEmail: 'dr@example.com',
          patientId: 'patient-1',
          patientName: 'Doe, John',
          patientEmail: 'john@example.com',
        },
      ];

      const csv = generateCSV(data);

      expect(csv).toContain('"Dr. Smith, Jr."');
      expect(csv).toContain('"Doe, John"');
    });

    it('should escape values with quotes', () => {
      const data: ExportedDataRecord[] = [
        {
          doctorId: 'doc-1',
          doctorName: 'Dr. "The Best" Smith',
          doctorEmail: 'dr@example.com',
          patientId: 'patient-1',
          patientName: 'John Doe',
          patientEmail: 'john@example.com',
        },
      ];

      const csv = generateCSV(data);

      expect(csv).toContain('"Dr. ""The Best"" Smith"');
    });

    it('should handle undefined values', () => {
      const data: ExportedDataRecord[] = [
        {
          doctorId: 'doc-1',
          doctorName: 'Dr. Smith',
          doctorEmail: 'dr@example.com',
          patientId: 'patient-1',
          patientName: 'John',
          patientEmail: 'john@example.com',
          riskScore: undefined,
          mmseScore: undefined,
        },
      ];

      const csv = generateCSV(data);

      expect(csv).not.toContain('undefined');
    });
  });

  describe('generateJSON', () => {
    it('should generate formatted JSON string', () => {
      const data: ExportedDataRecord[] = [
        {
          doctorId: 'doc-1',
          doctorName: 'Dr. Smith',
          doctorEmail: 'dr@example.com',
          patientId: 'patient-1',
          patientName: 'John Doe',
          patientEmail: 'john@example.com',
          riskScore: 75,
        },
      ];

      const json = generateJSON(data);
      const parsed = JSON.parse(json);

      expect(parsed).toHaveLength(1);
      expect(parsed[0].doctorName).toBe('Dr. Smith');
      expect(parsed[0].riskScore).toBe(75);
    });

    it('should return empty array for empty data', () => {
      const json = generateJSON([]);
      const parsed = JSON.parse(json);

      expect(parsed).toEqual([]);
    });
  });

  describe('getFormattedExport', () => {
    it('should return CSV formatted export', async () => {
      const mockDoctorDocs = [
        {
          id: 'doctor-1',
          data: () => ({ fullName: 'Dr. Smith', email: 'dr@example.com' }),
        },
      ];

      vi.mocked(getDocs)
        .mockResolvedValueOnce({ docs: mockDoctorDocs } as any)
        .mockResolvedValueOnce({ docs: [{ id: 'patient-1' }] } as any);

      vi.mocked(getDoc)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({ fullName: 'Patient One', email: 'p1@example.com' }),
        } as any)
        .mockResolvedValueOnce({ exists: () => false } as any);

      const result = await getFormattedExport({
        format: 'csv',
        includePatients: true,
      });

      expect(result.mimeType).toBe('text/csv');
      expect(result.filename).toMatch(/^nms-export-.*\.csv$/);
      expect(result.data).toContain('Doctor ID');
    });

    it('should return JSON formatted export', async () => {
      const mockDoctorDocs = [
        {
          id: 'doctor-1',
          data: () => ({ fullName: 'Dr. Smith', email: 'dr@example.com' }),
        },
      ];

      vi.mocked(getDocs)
        .mockResolvedValueOnce({ docs: mockDoctorDocs } as any)
        .mockResolvedValueOnce({ docs: [{ id: 'patient-1' }] } as any);

      vi.mocked(getDoc)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({ fullName: 'Patient One', email: 'p1@example.com' }),
        } as any)
        .mockResolvedValueOnce({ exists: () => false } as any);

      const result = await getFormattedExport({
        format: 'json',
        includePatients: true,
      });

      expect(result.mimeType).toBe('application/json');
      expect(result.filename).toMatch(/^nms-export-.*\.json$/);
      const parsed = JSON.parse(result.data);
      expect(Array.isArray(parsed)).toBe(true);
    });

    it('should throw error when export fails', async () => {
      vi.mocked(getDocs).mockRejectedValue(new Error('Export failed'));

      await expect(
        getFormattedExport({
          format: 'json',
          includePatients: true,
        })
      ).rejects.toThrow('Export failed');
    });
  });
});
