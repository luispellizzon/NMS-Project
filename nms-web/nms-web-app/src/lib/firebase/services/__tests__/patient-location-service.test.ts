// src/lib/firebase/services/__tests__/patient-location-service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPatientLocationData } from '../patient-location-service';
import { collection, getDocs, query, where } from 'firebase/firestore';

// Mock firebase/firestore
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(() => ({})),
  getDocs: vi.fn(),
  query: vi.fn(() => ({})),
  where: vi.fn(() => ({})),
  doc: vi.fn(() => ({})),
  getDoc: vi.fn(),
}));

// Mock firebase config
vi.mock('../config', () => ({
  db: {},
}));

// Mock country coordinates utility
vi.mock('@/lib/utils/countryCoordinates', () => ({
  getCountryCoordinates: vi.fn((country: string) => {
    const coords: Record<string, any> = {
      Ireland: { lat: 53.1424, lon: -7.6921, city: 'Dublin' },
      UK: { lat: 51.5074, lon: -0.1278, city: 'London' },
      USA: { lat: 40.7128, lon: -74.0060, city: 'New York' },
    };
    return coords[country] || { lat: 0, lon: 0, city: 'Unknown' };
  }),
}));

describe('patient-location-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('getPatientLocationData', () => {
    it('should fetch and aggregate patient location data for a specific doctor', async () => {
      const mockDoctorPatients = [
        { data: () => ({ patientId: 'patient-1' }) },
        { data: () => ({ patientId: 'patient-2' }) },
      ];

      const mockPatientData = [
        {
          id: 'patient-1',
          data: () => ({
            location: 'Ireland',
            mmseScore: 25,
            role: 'patient',
          }),
        },
        {
          id: 'patient-2',
          data: () => ({
            location: 'Ireland',
            mmseScore: 20,
            role: 'patient',
          }),
        },
      ];

      vi.mocked(getDocs)
        .mockResolvedValueOnce({
          docs: mockDoctorPatients,
        } as any)
        .mockResolvedValueOnce({
          docs: mockPatientData.map(p => ({
            id: p.id,
            data: p.data,
          })),
        } as any);

      const result = await getPatientLocationData('doctor-123');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        city: 'Dublin',
        patientCount: 2,
        riskLevel: 'Low',
      });
      expect(result[0].lat).toBeCloseTo(53.1424);
      expect(result[0].lon).toBeCloseTo(-7.6921);
    });

    it('should fetch all patients when no doctorId is provided', async () => {
      const mockPatientData = [
        {
          id: 'patient-1',
          data: () => ({
            location: 'Ireland',
            mmseScore: 25,
            role: 'patient',
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValueOnce({
        docs: mockPatientData.map(p => ({
          id: p.id,
          data: p.data,
        })),
      } as any);

      const result = await getPatientLocationData();

      expect(result).toHaveLength(1);
      expect(result[0].city).toBe('Dublin');
    });

    it('should return empty array if doctor has no patients', async () => {
      vi.mocked(getDocs).mockResolvedValueOnce({
        docs: [],
      } as any);

      const result = await getPatientLocationData('doctor-123');

      expect(result).toEqual([]);
    });

    it('should handle multiple countries', async () => {
      const mockDoctorPatients = [
        { data: () => ({ patientId: 'patient-1' }) },
        { data: () => ({ patientId: 'patient-2' }) },
        { data: () => ({ patientId: 'patient-3' }) },
      ];

      const mockPatientData = [
        {
          id: 'patient-1',
          data: () => ({
            location: 'Ireland',
            mmseScore: 25,
            role: 'patient',
          }),
        },
        {
          id: 'patient-2',
          data: () => ({
            location: 'UK',
            mmseScore: 15,
            role: 'patient',
          }),
        },
        {
          id: 'patient-3',
          data: () => ({
            location: 'USA',
            mmseScore: 10,
            role: 'patient',
          }),
        },
      ];

      vi.mocked(getDocs)
        .mockResolvedValueOnce({
          docs: mockDoctorPatients,
        } as any)
        .mockResolvedValueOnce({
          docs: mockPatientData.map(p => ({
            id: p.id,
            data: p.data,
          })),
        } as any);

      const result = await getPatientLocationData('doctor-123');

      expect(result).toHaveLength(3);
      expect(result.map(r => r.city).sort()).toEqual(['Dublin', 'London', 'New York'].sort());
    });

    it('should calculate correct risk levels', async () => {
      const mockDoctorPatients = [
        { data: () => ({ patientId: 'patient-1' }) },
        { data: () => ({ patientId: 'patient-2' }) },
        { data: () => ({ patientId: 'patient-3' }) },
      ];

      const mockPatientData = [
        {
          id: 'patient-1',
          data: () => ({
            location: 'Ireland',
            mmseScore: 27, // Low risk
            role: 'patient',
          }),
        },
        {
          id: 'patient-2',
          data: () => ({
            location: 'UK',
            mmseScore: 15, // Medium risk
            role: 'patient',
          }),
        },
        {
          id: 'patient-3',
          data: () => ({
            location: 'USA',
            mmseScore: 5, // High risk
            role: 'patient',
          }),
        },
      ];

      vi.mocked(getDocs)
        .mockResolvedValueOnce({
          docs: mockDoctorPatients,
        } as any)
        .mockResolvedValueOnce({
          docs: mockPatientData.map(p => ({
            id: p.id,
            data: p.data,
          })),
        } as any);

      const result = await getPatientLocationData('doctor-123');

      const ireland = result.find(r => r.city === 'Dublin');
      const uk = result.find(r => r.city === 'London');
      const usa = result.find(r => r.city === 'New York');

      expect(ireland?.riskLevel).toBe('Low');
      expect(uk?.riskLevel).toBe('Medium');
      expect(usa?.riskLevel).toBe('High');
    });

    it('should default location to Ireland if not specified', async () => {
      const mockPatientData = [
        {
          id: 'patient-1',
          data: () => ({
            mmseScore: 25,
            role: 'patient',
            // No location field
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValueOnce({
        docs: mockPatientData.map(p => ({
          id: p.id,
          data: p.data,
        })),
      } as any);

      const result = await getPatientLocationData();

      expect(result).toHaveLength(1);
      expect(result[0].city).toBe('Dublin');
    });

    it('should handle patients without mmseScore', async () => {
      const mockPatientData = [
        {
          id: 'patient-1',
          data: () => ({
            location: 'Ireland',
            role: 'patient',
            // No mmseScore
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValueOnce({
        docs: mockPatientData.map(p => ({
          id: p.id,
          data: p.data,
        })),
      } as any);

      const result = await getPatientLocationData();

      expect(result).toHaveLength(1);
      expect(result[0].patientCount).toBe(1);
    });

    it('should sort locations by patient count descending', async () => {
      const mockPatientData = [
        {
          id: 'patient-1',
          data: () => ({ location: 'Ireland', mmseScore: 25, role: 'patient' }),
        },
        {
          id: 'patient-2',
          data: () => ({ location: 'UK', mmseScore: 25, role: 'patient' }),
        },
        {
          id: 'patient-3',
          data: () => ({ location: 'UK', mmseScore: 25, role: 'patient' }),
        },
        {
          id: 'patient-4',
          data: () => ({ location: 'UK', mmseScore: 25, role: 'patient' }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValueOnce({
        docs: mockPatientData.map(p => ({
          id: p.id,
          data: p.data,
        })),
      } as any);

      const result = await getPatientLocationData();

      expect(result[0].city).toBe('London'); // UK has 3 patients
      expect(result[0].patientCount).toBe(3);
      expect(result[1].city).toBe('Dublin'); // Ireland has 1 patient
      expect(result[1].patientCount).toBe(1);
    });

    it('should handle batching for more than 30 patients', async () => {
      // Create 35 patient IDs to test batching
      const mockDoctorPatients = Array.from({ length: 35 }, (_, i) => ({
        data: () => ({ patientId: `patient-${i}` }),
      }));

      const mockPatientData = Array.from({ length: 35 }, (_, i) => ({
        id: `patient-${i}`,
        data: () => ({
          location: 'Ireland',
          mmseScore: 25,
          role: 'patient',
        }),
      }));

      vi.mocked(getDocs)
        .mockResolvedValueOnce({
          docs: mockDoctorPatients,
        } as any)
        .mockResolvedValueOnce({
          docs: mockPatientData.slice(0, 30).map(p => ({
            id: p.id,
            data: p.data,
          })),
        } as any)
        .mockResolvedValueOnce({
          docs: mockPatientData.slice(30).map(p => ({
            id: p.id,
            data: p.data,
          })),
        } as any);

      const result = await getPatientLocationData('doctor-123');

      expect(result).toHaveLength(1);
      expect(result[0].patientCount).toBe(35);
    });

    it('should throw error on failure', async () => {
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      await expect(getPatientLocationData('doctor-123')).rejects.toThrow(
        'Failed to fetch patient location data'
      );
    });
  });
});
