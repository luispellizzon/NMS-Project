// src/lib/firebase/services/patient-location-service.ts
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../config';
import { getCountryCoordinates } from '@/lib/utils/countryCoordinates';
import { PatientLocation } from '@/types/location';

/**
 * Aggregate patient data by location and calculate risk levels
 */
export async function getPatientLocationData(doctorId?: string): Promise<PatientLocation[]> {
  try {
    let patientIds: string[] = [];

    if (doctorId) {
      // Fetch patient IDs from doctor's patients subcollection
      const patientsSubcollectionRef = collection(db, 'doctors', doctorId, 'patients');
      const patientsSnapshot = await getDocs(patientsSubcollectionRef);
      patientIds = patientsSnapshot.docs.map(doc => doc.data().patientId);

      if (patientIds.length === 0) {
        console.warn('No patients found for doctor:', doctorId);
        return [];
      }
    }

    // Fetch patient data from users collection
    const usersRef = collection(db, 'users');
    let patients: any[] = [];

    if (doctorId && patientIds.length > 0) {
      // Firestore 'in' queries are limited to 30 items, so we need to batch
      const patientDataPromises = [];

      // Split into batches of 30
      for (let i = 0; i < patientIds.length; i += 30) {
        const batch = patientIds.slice(i, i + 30);
        const batchQuery = query(
          usersRef,
          where('role', '==', 'patient'),
          where('__name__', 'in', batch)
        );
        patientDataPromises.push(getDocs(batchQuery));
      }

      const batchSnapshots = await Promise.all(patientDataPromises);
      patients = batchSnapshots.flatMap(snapshot =>
        snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      );
    } else {
      // Fetch all patients if no doctorId provided
      const patientsQuery = query(usersRef, where('role', '==', 'patient'));
      const querySnapshot = await getDocs(patientsQuery);
      patients = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    return aggregateLocationData(patients);
  } catch (error) {
    console.error('Error fetching patient location data:', error);
    throw new Error('Failed to fetch patient location data');
  }
}

/**
 * Aggregate patient data by location
 */
function aggregateLocationData(patients: any[]): PatientLocation[] {
  // Group patients by country
  const locationMap = new Map<string, {
    patients: any[];
    totalRiskScore: number;
    country: string;
  }>();

  patients.forEach(patient => {
    const country = patient.location || 'Ireland'; // Default to Ireland if no location

    if (!locationMap.has(country)) {
      locationMap.set(country, {
        patients: [],
        totalRiskScore: 0,
        country,
      });
    }

    const locationData = locationMap.get(country)!;
    locationData.patients.push(patient);

    // Add risk score if available (mmseScore is stored on the user document)
    if (patient.mmseScore !== undefined) {
      // Convert MMSE score (0-30) to risk score (0-10)
      // Lower MMSE = higher risk
      const riskScore = 10 - (patient.mmseScore / 3);
      locationData.totalRiskScore += riskScore;
    }
  });

  // Convert map to array of PatientLocation objects
  const locations: PatientLocation[] = [];

  locationMap.forEach((data, country) => {
    const coords = getCountryCoordinates(country);
    const patientCount = data.patients.length;
    const avgRiskScore = patientCount > 0 ? data.totalRiskScore / patientCount : 0;

    // Determine risk level based on average risk score
    let riskLevel: 'Low' | 'Medium' | 'High';
    let color: string;

    if (avgRiskScore < 3.3) {
      riskLevel = 'Low';
      color = '#10b981'; // green
    } else if (avgRiskScore < 6.6) {
      riskLevel = 'Medium';
      color = '#3b82f6'; // blue
    } else {
      riskLevel = 'High';
      color = '#ef4444'; // red
    }

    // Scale marker size based on patient count (min 0.8, max 2.0)
    const scale = Math.min(2.0, Math.max(0.8, 0.8 + (patientCount / 20)));

    locations.push({
      lat: coords.lat,
      lon: coords.lon,
      city: coords.city,
      patientCount,
      riskLevel,
      color,
      scale,
    });
  });

  return locations.sort((a, b) => b.patientCount - a.patientCount);
}