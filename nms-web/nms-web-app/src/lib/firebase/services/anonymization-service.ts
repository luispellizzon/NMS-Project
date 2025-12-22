// src/lib/firebase/services/anonymization-service.ts
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import {
  AnonymizedPatientData,
  EligiblePatient,
  BatchAnonymizationResult,
  DatasetStats,
} from '@/types/anonymization';
import { RiskAssessmentDocument, Gender } from '@/types/patient';
import { getPatientById, getPatientRiskAssessment } from './patient-service';
import { getDoctorPatients } from './doctor-service';

// Encryption key from environment (must be 32 bytes for AES-256)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-32-byte-key-change-me!!';
const IV_LENGTH = 16;

/**
 * Encrypt a string using AES-256
 */
function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
    iv
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Calculate age from date of birth string
 * Supports formats: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
 */
function calculateAge(dateOfBirth: string): number {
  let birthDate: Date;

  // Try to parse DD/MM/YYYY format (e.g., "23/02/1998")
  if (dateOfBirth.includes('/')) {
    const parts = dateOfBirth.split('/');
    if (parts.length === 3) {
      // Assume DD/MM/YYYY format
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);

      // Check if it looks like DD/MM/YYYY (day > 12) or could be MM/DD/YYYY
      if (day > 12) {
        // Definitely DD/MM/YYYY
        birthDate = new Date(year, month - 1, day);
      } else {
        // Ambiguous - try DD/MM/YYYY first (common in Europe)
        birthDate = new Date(year, month - 1, day);
      }
    } else {
      birthDate = new Date(dateOfBirth);
    }
  } else {
    // ISO format or other
    birthDate = new Date(dateOfBirth);
  }

  if (isNaN(birthDate.getTime())) {
    throw new Error(`Invalid date of birth format: ${dateOfBirth}`);
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Map education level from Firebase format to HF model format
 */
function mapEducationLevel(level: string): 'No School' | 'Primary' | 'Secondary' | 'Tertiary' {
  const normalized = level.toLowerCase();
  if (normalized.includes('no') || normalized.includes('none')) return 'No School';
  if (normalized.includes('primary') || normalized.includes('elementary')) return 'Primary';
  if (normalized.includes('secondary') || normalized.includes('high')) return 'Secondary';
  return 'Tertiary';
}

/**
 * Map genetic status to APOE_ε4 format
 */
function mapGeneticStatus(genetic: string): 'Positive' | 'Negative' {
  return genetic.toLowerCase().includes('positive') ? 'Positive' : 'Negative';
}

/**
 * Convert MMSE score (0-30) to Cognitive Test Score (0-10)
 * Formula: 10 - (MMSE / 3)
 */
function invertMMSE(mmseScore: number): number {
  return Math.max(0, Math.min(10, 10 - (mmseScore / 3)));
}

/**
 * Capitalize first letter of each word
 */
function capitalize(str: string): string {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Get list of patients eligible for anonymization
 */
export async function getEligiblePatientsForAnonymization(
  doctorId: string
): Promise<EligiblePatient[]> {
  try {
    // Get all patient IDs assigned to this doctor
    const patientIds = await getDoctorPatients(doctorId);
    console.log(`[Anonymization] Found ${patientIds.length} patients for doctor ${doctorId}:`, patientIds);

    // Get anonymized patient IDs to check who's already been anonymized
    const anonymizedSnapshot = await getDocs(collection(db, 'nms_patient_data'));
    const anonymizedSourceIds = new Set(
      anonymizedSnapshot.docs.map(doc => {
        const data = doc.data();
        return data.sourcePatientId; // This is encrypted, but we'll check it
      })
    );

    const eligiblePatients: EligiblePatient[] = [];

    // Check each patient for eligibility
    for (const patientId of patientIds) {
      console.log(`[Anonymization] Checking patient ${patientId}`);
      const patient = await getPatientById(patientId);

      if (!patient) {
        console.warn(`[Anonymization] Patient ${patientId} not found`);
        continue;
      }

      console.log(`[Anonymization] Patient ${patientId} data:`, {
        hasCompletedRiskAssessment: patient.hasCompletedRiskAssessment,
        mmseScore: patient.mmseScore,
        dataUsageConsent: patient.dataUsageConsent,
      });

      // Check eligibility criteria
      const hasCompletedAssessments =
        patient.hasCompletedRiskAssessment &&
        patient.mmseScore !== undefined &&
        patient.mmseScore !== null;

      const hasConsent = patient.dataUsageConsent === true;

      // Check if already anonymized (encrypted ID check)
      const encryptedId = encrypt(patientId);
      const alreadyAnonymized = anonymizedSourceIds.has(encryptedId);

      console.log(`[Anonymization] Patient ${patientId} eligibility:`, {
        hasCompletedAssessments,
        hasConsent,
        alreadyAnonymized,
        eligible: hasCompletedAssessments && hasConsent && !alreadyAnonymized,
      });

      if (hasCompletedAssessments && hasConsent && !alreadyAnonymized) {
        try {
          // Calculate age for display
          const age = calculateAge(patient.dateOfBirth);

          // Get most recent assessment date
          const riskAssessment = await getPatientRiskAssessment(patientId);
          const assessmentDate = patient.createdAt
            ? new Date(patient.createdAt.toDate ? patient.createdAt.toDate() : patient.createdAt)
            : new Date();

          eligiblePatients.push({
            id: patientId,
            maskedId: `PAT-${patientId.slice(-4)}`,
            fullName: patient.fullName,
            assessmentDate: assessmentDate.toISOString().split('T')[0],
            mmseScore: patient.mmseScore,
            riskLevel: patient.riskLevel || 'Moderate',
            consentGiven: hasConsent,
            alreadyAnonymized: alreadyAnonymized,
          });

          console.log(`[Anonymization] ✓ Patient ${patientId} added to eligible list`);
        } catch (err) {
          console.error(`[Anonymization] Error processing eligible patient ${patientId}:`, err);
        }
      }
    }

    console.log(`[Anonymization] Total eligible patients: ${eligiblePatients.length}`);
    return eligiblePatients;
  } catch (error) {
    console.error('Error fetching eligible patients:', error);
    throw new Error('Failed to fetch eligible patients for anonymization');
  }
}

/**
 * Anonymize a single patient's data
 */
export async function anonymizePatientData(
  patientId: string
): Promise<AnonymizedPatientData> {
  try {
    // Fetch patient data
    const patient = await getPatientById(patientId);
    if (!patient) {
      throw new Error(`Patient not found: ${patientId}`);
    }

    // Check consent
    if (!patient.dataUsageConsent) {
      throw new Error('Patient has not given consent for data usage');
    }

    // Fetch risk assessment
    const riskAssessmentSnapshot = await getDocs(
      collection(db, 'users', patientId, 'risk_assessment')
    );

    if (riskAssessmentSnapshot.empty) {
      throw new Error('No risk assessment found for patient');
    }

    const riskAssessment = riskAssessmentSnapshot.docs[0].data() as RiskAssessmentDocument;

    // Validate MMSE score
    if (patient.mmseScore === undefined || patient.mmseScore === null) {
      throw new Error('Patient does not have a valid MMSE score');
    }

    // Calculate age
    const age = calculateAge(patient.dateOfBirth);

    // Create anonymized data
    const anonymizedData: AnonymizedPatientData = {
      anonymousId: uuidv4(),
      Age: age,
      Weight: riskAssessment.weight,
      Dominant_Hand: capitalize(riskAssessment.dominant_hand) as 'Right' | 'Left' | 'Ambidextrous',
      Gender: riskAssessment.gender as 'Male' | 'Female',
      Education_Level: mapEducationLevel(riskAssessment.education_level),
      Smoking_Status: riskAssessment.smoking_status,
      Alcohol_Use: riskAssessment.alcohol_use as 'Non-Drinker' | 'Occasional' | 'Regular',
      Physical_Activity: riskAssessment.physical_activity,
      Nutrition_Diet: riskAssessment.nutrition_diet,
      Sleep_Quality: riskAssessment.sleep_quality as 'Poor' | 'Average' | 'Good',
      Diabetic: riskAssessment.diabetic.toLowerCase() === 'yes' ? '1' : '0',
      Family_History: riskAssessment.family_history as 'Yes' | 'No',
      Depression_Status: riskAssessment.depression_status as 'Yes' | 'No',
      APOE_ε4: mapGeneticStatus(riskAssessment.genetic),
      Medication_History: riskAssessment.medication_history as 'Yes' | 'No',
      Chronic_Health_Conditions: riskAssessment.chronic_health_conditions,
      Cognitive_Test_Scores: invertMMSE(patient.mmseScore),

      // Metadata
      anonymizedAt: serverTimestamp() as any,
      sourcePatientId: encrypt(patientId),
      usedInTraining: false,
      dataVersion: '1.0',
    };

    // Store in nms_patient_data collection
    await setDoc(
      doc(db, 'nms_patient_data', anonymizedData.anonymousId),
      anonymizedData
    );

    return anonymizedData;
  } catch (error) {
    console.error(`Error anonymizing patient ${patientId}:`, error);
    throw error;
  }
}

/**
 * Batch anonymize multiple patients
 */
export async function batchAnonymizePatients(
  patientIds: string[]
): Promise<BatchAnonymizationResult> {
  const result: BatchAnonymizationResult = {
    success: true,
    totalRequested: patientIds.length,
    successfullyAnonymized: 0,
    failed: 0,
    errors: [],
    anonymizedIds: [],
  };

  for (const patientId of patientIds) {
    try {
      const anonymizedData = await anonymizePatientData(patientId);
      result.successfullyAnonymized++;
      result.anonymizedIds.push(anonymizedData.anonymousId);
    } catch (error) {
      result.failed++;
      result.errors.push({
        patientId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  result.success = result.failed === 0;
  return result;
}

/**
 * Get dataset statistics
 */
export async function getAnonymizedDataStats(): Promise<DatasetStats> {
  try {
    const anonymizedSnapshot = await getDocs(collection(db, 'nms_patient_data'));

    const stats: DatasetStats = {
      totalRecords: anonymizedSnapshot.size,
      lastAnonymized: null,
      newRecordsSinceLastTraining: 0,
      distribution: {
        ageGroups: {
          '40-50': 0,
          '51-60': 0,
          '61-70': 0,
          '71+': 0,
        },
        gender: {
          Male: 0,
          Female: 0,
        },
        riskLevels: {
          Low: 0,
          Moderate: 0,
          High: 0,
        },
      },
    };

    let mostRecentDate: Date | null = null;

    anonymizedSnapshot.docs.forEach(doc => {
      const data = doc.data() as AnonymizedPatientData;

      // Update last anonymized date
      if (data.anonymizedAt) {
        const date = data.anonymizedAt instanceof Timestamp
          ? data.anonymizedAt.toDate()
          : new Date(data.anonymizedAt);
        if (!mostRecentDate || date > mostRecentDate) {
          mostRecentDate = date;
        }
      }

      // Count new records (not yet used in training)
      if (!data.usedInTraining) {
        stats.newRecordsSinceLastTraining++;
      }

      // Age distribution
      if (data.Age >= 40 && data.Age <= 50) stats.distribution.ageGroups['40-50']++;
      else if (data.Age >= 51 && data.Age <= 60) stats.distribution.ageGroups['51-60']++;
      else if (data.Age >= 61 && data.Age <= 70) stats.distribution.ageGroups['61-70']++;
      else if (data.Age > 70) stats.distribution.ageGroups['71+']++;

      // Gender distribution
      if (data.Gender === 'Male') stats.distribution.gender.Male++;
      else if (data.Gender === 'Female') stats.distribution.gender.Female++;

      // Risk level estimation based on Cognitive_Test_Scores
      const severity = data.Cognitive_Test_Scores / 10;
      if (severity < 0.3) stats.distribution.riskLevels.Low++;
      else if (severity < 0.6) stats.distribution.riskLevels.Moderate++;
      else stats.distribution.riskLevels.High++;
    });

    if (mostRecentDate) {
      stats.lastAnonymized = (mostRecentDate as Date).toISOString();
    }

    return stats;
  } catch (error) {
    console.error('Error fetching anonymized data stats:', error);
    throw new Error('Failed to fetch dataset statistics');
  }
}