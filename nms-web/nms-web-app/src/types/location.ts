// src/types/location.ts

/**
 * Represents aggregated patient data by geographic location
 * Used for the geographic distribution globe visualization
 */
export interface PatientLocation {
  lat: number;
  lon: number;
  city: string;
  patientCount: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  color: string;
  scale: number;
}