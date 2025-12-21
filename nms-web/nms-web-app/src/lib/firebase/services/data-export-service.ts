// src/lib/firebase/services/data-export-service.ts

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../config';
import {
  DataExportOptions,
  DataExportResult,
  ExportedDataRecord,
} from '@/types/admin';

/**
 * Calculates age from date of birth string.
 * @param dateOfBirth Date of birth string (various formats supported).
 * @returns Age in years or undefined if invalid.
 */
function calculateAge(dateOfBirth: string | undefined): number | undefined {
  if (!dateOfBirth) return undefined;

  try {
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) return undefined;

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return age;
  } catch {
    return undefined;
  }
}

/**
 * Gets all patients assigned to a doctor with their risk assessments.
 * @param doctorId The doctor's UID.
 * @returns Array of patient records with assessments.
 */
async function getDoctorPatientsWithAssessments(
  doctorId: string,
  doctorName: string,
  doctorEmail: string
): Promise<ExportedDataRecord[]> {
  const records: ExportedDataRecord[] = [];

  try {
    // Get patient IDs from doctor's subcollection
    const patientsRef = collection(db, 'doctors', doctorId, 'patients');
    const patientsSnapshot = await getDocs(patientsRef);

    for (const patientDoc of patientsSnapshot.docs) {
      const patientId = patientDoc.id;

      // Fetch patient details from users collection
      const userDocRef = doc(db, 'users', patientId);
      const userSnapshot = await getDoc(userDocRef);

      if (!userSnapshot.exists()) continue;

      const patientData = userSnapshot.data();

      // Fetch risk assessment if exists
      let riskScore: number | undefined;
      let riskLevel: string | undefined;
      let mmseScore: number | undefined;
      let assessmentDate: string | undefined;

      // Try to get from user document first (some data may be stored directly)
      if (patientData.riskScore !== undefined) {
        riskScore = patientData.riskScore;
      }
      if (patientData.riskLevel) {
        riskLevel = patientData.riskLevel;
      }
      if (patientData.mmseScore !== undefined) {
        mmseScore = patientData.mmseScore;
      }

      // Try to get from risk_assessments collection
      try {
        const assessmentDocRef = doc(db, 'risk_assessments', patientId);
        const assessmentSnapshot = await getDoc(assessmentDocRef);

        if (assessmentSnapshot.exists()) {
          const assessmentData = assessmentSnapshot.data();
          if (assessmentData.riskScore !== undefined) {
            riskScore = assessmentData.riskScore;
          }
          if (assessmentData.riskLevel) {
            riskLevel = assessmentData.riskLevel;
          }
          if (assessmentData.mmseScore !== undefined) {
            mmseScore = assessmentData.mmseScore;
          }
          if (assessmentData.assessmentDate) {
            assessmentDate = assessmentData.assessmentDate.toDate?.()?.toISOString()
              || assessmentData.assessmentDate;
          }
          if (assessmentData.createdAt) {
            assessmentDate = assessmentData.createdAt.toDate?.()?.toISOString()
              || assessmentData.createdAt;
          }
        }
      } catch {
        // Assessment not found, continue with what we have
      }

      records.push({
        doctorId,
        doctorName,
        doctorEmail,
        patientId,
        patientName: patientData.fullName || '',
        patientEmail: patientData.email || '',
        patientAge: calculateAge(patientData.dateOfBirth),
        patientGender: patientData.gender,
        riskScore,
        riskLevel,
        mmseScore,
        assessmentDate,
      });
    }

    return records;
  } catch (error) {
    console.error(`Error fetching patients for doctor ${doctorId}:`, error);
    return records;
  }
}

/**
 * Exports all doctors' patients with their risk assessment data.
 * @param options Export options (doctor filter, date range, format).
 * @returns Export result with data.
 */
export const exportAllData = async (
  options: DataExportOptions
): Promise<DataExportResult> => {
  try {
    const allRecords: ExportedDataRecord[] = [];
    let totalDoctors = 0;
    const processedPatients = new Set<string>();

    // Get doctors to process
    const doctorsRef = collection(db, 'doctors');
    let doctorsSnapshot;

    if (options.doctorIds && options.doctorIds.length > 0) {
      // Firestore 'in' query supports up to 30 items
      const chunks = [];
      for (let i = 0; i < options.doctorIds.length; i += 30) {
        chunks.push(options.doctorIds.slice(i, i + 30));
      }

      for (const chunk of chunks) {
        const q = query(doctorsRef, where('__name__', 'in', chunk));
        const snapshot = await getDocs(q);
        snapshot.docs.forEach((doc) => {
          // Process each doctor
        });
      }

      // For simplicity, fetch all and filter
      doctorsSnapshot = await getDocs(doctorsRef);
    } else {
      doctorsSnapshot = await getDocs(doctorsRef);
    }

    // Process each doctor
    for (const doctorDoc of doctorsSnapshot.docs) {
      // Skip if specific doctors requested and this one isn't in the list
      if (options.doctorIds && options.doctorIds.length > 0) {
        if (!options.doctorIds.includes(doctorDoc.id)) continue;
      }

      const doctorData = doctorDoc.data();
      totalDoctors++;

      if (options.includePatients) {
        const patientRecords = await getDoctorPatientsWithAssessments(
          doctorDoc.id,
          doctorData.fullName || '',
          doctorData.email || ''
        );

        // Filter by date range if specified
        let filteredRecords = patientRecords;
        if (options.dateRange && options.includeRiskAssessments) {
          filteredRecords = patientRecords.filter((record) => {
            if (!record.assessmentDate) return true; // Include records without dates
            const assessmentDate = new Date(record.assessmentDate);
            return (
              assessmentDate >= options.dateRange!.from &&
              assessmentDate <= options.dateRange!.to
            );
          });
        }

        filteredRecords.forEach((record) => {
          if (!processedPatients.has(record.patientId)) {
            allRecords.push(record);
            processedPatients.add(record.patientId);
          }
        });
      }
    }

    // Count assessments
    const totalAssessments = allRecords.filter(
      (r) => r.riskScore !== undefined || r.mmseScore !== undefined
    ).length;

    return {
      success: true,
      totalDoctors,
      totalPatients: processedPatients.size,
      totalAssessments,
      data: allRecords,
    };
  } catch (error) {
    console.error('Error exporting data:', error);
    return {
      success: false,
      totalDoctors: 0,
      totalPatients: 0,
      totalAssessments: 0,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Converts export data to CSV format.
 * @param data Array of exported records.
 * @returns CSV string.
 */
export const generateCSV = (data: ExportedDataRecord[]): string => {
  if (data.length === 0) return '';

  // Define headers
  const headers = [
    'Doctor ID',
    'Doctor Name',
    'Doctor Email',
    'Patient ID',
    'Patient Name',
    'Patient Email',
    'Patient Age',
    'Patient Gender',
    'Risk Score',
    'Risk Level',
    'MMSE Score',
    'Assessment Date',
  ];

  // Escape CSV values
  const escapeCSV = (value: string | number | undefined): string => {
    if (value === undefined || value === null) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Build CSV rows
  const rows = data.map((record) => [
    escapeCSV(record.doctorId),
    escapeCSV(record.doctorName),
    escapeCSV(record.doctorEmail),
    escapeCSV(record.patientId),
    escapeCSV(record.patientName),
    escapeCSV(record.patientEmail),
    escapeCSV(record.patientAge),
    escapeCSV(record.patientGender),
    escapeCSV(record.riskScore),
    escapeCSV(record.riskLevel),
    escapeCSV(record.mmseScore),
    escapeCSV(record.assessmentDate),
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
};

/**
 * Converts export data to JSON format.
 * @param data Array of exported records.
 * @returns JSON string.
 */
export const generateJSON = (data: ExportedDataRecord[]): string => {
  return JSON.stringify(data, null, 2);
};

/**
 * Gets export data and formats it according to options.
 * @param options Export options.
 * @returns Formatted export data string.
 */
export const getFormattedExport = async (
  options: DataExportOptions
): Promise<{ data: string; mimeType: string; filename: string }> => {
  const result = await exportAllData(options);

  if (!result.success) {
    throw new Error(result.error || 'Export failed');
  }

  const timestamp = new Date().toISOString().split('T')[0];

  if (options.format === 'csv') {
    return {
      data: generateCSV(result.data),
      mimeType: 'text/csv',
      filename: `nms-export-${timestamp}.csv`,
    };
  } else {
    return {
      data: generateJSON(result.data),
      mimeType: 'application/json',
      filename: `nms-export-${timestamp}.json`,
    };
  }
};
