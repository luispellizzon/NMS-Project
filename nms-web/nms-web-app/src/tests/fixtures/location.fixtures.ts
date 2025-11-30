// src/tests/fixtures/location.fixtures.ts
import { PatientLocation } from '@/types/location';

/**
 * Mock patient location data for testing
 * These are test fixtures only - real data comes from Firebase
 */
export const mockPatientLocations: PatientLocation[] = [
  {
    city: 'New York',
    lat: 40.7128,
    lon: -74.006,
    patientCount: 120,
    riskLevel: 'High',
    color: '#ff0000',
    scale: 1.5,
  },
  {
    city: 'London',
    lat: 51.5074,
    lon: -0.1278,
    patientCount: 85,
    riskLevel: 'Medium',
    color: '#ffaa00',
    scale: 1.2,
  },
  {
    city: 'Tokyo',
    lat: 35.6762,
    lon: 139.6503,
    patientCount: 95,
    riskLevel: 'Medium',
    color: '#ffaa00',
    scale: 1.3,
  },
  {
    city: 'Paris',
    lat: 48.8566,
    lon: 2.3522,
    patientCount: 70,
    riskLevel: 'Low',
    color: '#00ff00',
    scale: 1.1,
  },
  {
    city: 'Sydney',
    lat: -33.8688,
    lon: 151.2093,
    patientCount: 55,
    riskLevel: 'Low',
    color: '#00ff00',
    scale: 1.0,
  },
];