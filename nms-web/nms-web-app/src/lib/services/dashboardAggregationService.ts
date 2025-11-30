// src/lib/services/dashboardAggregationService.ts

import {
  getDoctorPatients,
  getPatientById,
  getPatientRiskAssessment,
  getPatientTestHistory,
  getClinicalAssessment,
} from '@/lib/firebase/firestore-service';
import { RiskLevel } from '@/types/patient';

/**
 * Aggregated dashboard statistics for a doctor
 */
export interface DashboardStats {
  totalPatients: number;
  riskDistribution: {
    high: number;
    moderate: number;
    low: number;
  };
  averageScores: {
    cognitive: number;
    speech: number;
    memory: number;
    overall: number;
  };
  completionRates: {
    cognitiveAssessment: number;
    speechAssessment: number;
    memoryAssessment: number;
    riskAssessment: number;
    imageDescription: number;
  };
  demographicDistribution: {
    ageGroups: {
      '0-30': number;
      '31-50': number;
      '51-70': number;
      '70+': number;
    };
    gender: {
      male: number;
      female: number;
      other: number;
    };
  };
  testingActivity: {
    totalTests: number;
    averageTestsPerPatient: number;
    lastMonthTests: number;
  };
  clinicalAssessments: {
    total: number;
    withNotes: number;
  };
}

/**
 * Patient summary for dashboard display
 */
export interface PatientSummary {
  id: string;
  fullName: string;
  email: string;
  age: number;
  gender: string;
  riskScore: number;
  riskLevel: RiskLevel;
  totalTests: number;
  lastTestDate: string | null;
  hasClinicalAssessment: boolean;
  completionStatus: {
    cognitive: boolean;
    speech: boolean;
    memory: boolean;
    riskAssessment: boolean;
    imageDescription: boolean;
  };
}

/**
 * Calculate age group from age
 */
function getAgeGroup(age: number): '0-30' | '31-50' | '51-70' | '70+' {
  if (age <= 30) return '0-30';
  if (age <= 50) return '31-50';
  if (age <= 70) return '51-70';
  return '70+';
}

/**
 * Calculate average from array of numbers
 */
function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / numbers.length) * 10) / 10;
}

/**
 * Get aggregated dashboard statistics for a doctor
 * @param doctorId The doctor's UID
 * @returns Aggregated statistics
 */
export async function getDashboardStats(doctorId: string): Promise<DashboardStats> {
  try {
    // Get all patient IDs for this doctor
    const patientIds = await getDoctorPatients(doctorId);

    // Initialize statistics
    const stats: DashboardStats = {
      totalPatients: patientIds.length,
      riskDistribution: { high: 0, moderate: 0, low: 0 },
      averageScores: { cognitive: 0, speech: 0, memory: 0, overall: 0 },
      completionRates: {
        cognitiveAssessment: 0,
        speechAssessment: 0,
        memoryAssessment: 0,
        riskAssessment: 0,
        imageDescription: 0,
      },
      demographicDistribution: {
        ageGroups: { '0-30': 0, '31-50': 0, '51-70': 0, '70+': 0 },
        gender: { male: 0, female: 0, other: 0 },
      },
      testingActivity: {
        totalTests: 0,
        averageTestsPerPatient: 0,
        lastMonthTests: 0,
      },
      clinicalAssessments: {
        total: 0,
        withNotes: 0,
      },
    };

    if (patientIds.length === 0) {
      return stats;
    }

    // Fetch data for all patients in parallel
    const patientDataPromises = patientIds.map(async (patientId) => {
      const [patientInfo, riskAssessment, testHistory, clinicalAssessment] = await Promise.all([
        getPatientById(patientId),
        getPatientRiskAssessment(patientId),
        getPatientTestHistory(patientId),
        getClinicalAssessment(doctorId, patientId),
      ]);

      return {
        patientInfo,
        riskAssessment,
        testHistory,
        clinicalAssessment,
      };
    });

    const allPatientData = await Promise.all(patientDataPromises);

    // Arrays to collect scores for averaging
    const cognitiveScores: number[] = [];
    const speechScores: number[] = [];
    const memoryScores: number[] = [];
    const overallScores: number[] = [];

    // Counters for completion rates
    let completedCognitive = 0;
    let completedSpeech = 0;
    let completedMemory = 0;
    let completedRisk = 0;
    let completedImageDesc = 0;

    // Date threshold for last month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Process each patient's data
    allPatientData.forEach(({ patientInfo, riskAssessment, testHistory, clinicalAssessment }) => {
      if (!patientInfo) return;

      // Risk distribution
      const riskLevel = (riskAssessment?.riskLevel || 'Low').toLowerCase() as 'high' | 'moderate' | 'low';
      if (riskLevel in stats.riskDistribution) {
        stats.riskDistribution[riskLevel]++;
      }

      // Demographic distribution - Age
      const age = riskAssessment?.age || 0;
      if (age > 0) {
        const ageGroup = getAgeGroup(age);
        stats.demographicDistribution.ageGroups[ageGroup]++;
      }

      // Demographic distribution - Gender
      const gender = (riskAssessment?.gender || 'Other').toLowerCase() as 'male' | 'female' | 'other';
      if (gender in stats.demographicDistribution.gender) {
        stats.demographicDistribution.gender[gender]++;
      }

      // Completion rates
      if (patientInfo.hasCompletedCognitiveAssessment) completedCognitive++;
      if (patientInfo.hasCompletedSpeechAssessment) completedSpeech++;
      if (patientInfo.hasCompletedMemoryAssessment) completedMemory++;
      if (patientInfo.hasCompletedRiskAssessment) completedRisk++;
      if (patientInfo.hasCompletedImageDescription) completedImageDesc++;

      // Use MMSE score as a proxy for cognitive assessment (0-30 scale, normalize to 0-100)
      if (patientInfo.mmseScore !== undefined && patientInfo.mmseScore !== null) {
        const normalizedMMSE = (patientInfo.mmseScore / 30) * 100;
        cognitiveScores.push(normalizedMMSE);
        overallScores.push(normalizedMMSE);
      }

      // Test history analysis
      const totalTests = testHistory.length;
      stats.testingActivity.totalTests += totalTests;

      // Count tests in the last month
      testHistory.forEach((test) => {
        const testDate = new Date(test.date);
        if (testDate >= oneMonthAgo) {
          stats.testingActivity.lastMonthTests++;
        }
      });

      // Extract scores from test history
      testHistory.forEach((test) => {
        const [score, maxScore] = test.score.split('/').map(Number);
        if (!isNaN(score) && !isNaN(maxScore) && maxScore > 0) {
          const normalizedScore = (score / maxScore) * 100;

          if (test.testType === 'cognitive') {
            cognitiveScores.push(normalizedScore);
          } else if (test.testType === 'speech') {
            speechScores.push(normalizedScore);
          } else if (test.testType === 'memory') {
            memoryScores.push(normalizedScore);
          }

          overallScores.push(normalizedScore);
        }
      });

      // Clinical assessments
      if (clinicalAssessment) {
        stats.clinicalAssessments.total++;
        if (clinicalAssessment.notes && clinicalAssessment.notes.trim().length > 0) {
          stats.clinicalAssessments.withNotes++;
        }
      }
    });

    // Calculate averages
    stats.averageScores.cognitive = calculateAverage(cognitiveScores);
    stats.averageScores.speech = calculateAverage(speechScores);
    stats.averageScores.memory = calculateAverage(memoryScores);
    stats.averageScores.overall = calculateAverage(overallScores);

    // Calculate completion rates (as percentages)
    const totalPatients = stats.totalPatients;
    stats.completionRates.cognitiveAssessment = Math.round((completedCognitive / totalPatients) * 100);
    stats.completionRates.speechAssessment = Math.round((completedSpeech / totalPatients) * 100);
    stats.completionRates.memoryAssessment = Math.round((completedMemory / totalPatients) * 100);
    stats.completionRates.riskAssessment = Math.round((completedRisk / totalPatients) * 100);
    stats.completionRates.imageDescription = Math.round((completedImageDesc / totalPatients) * 100);

    // Calculate average tests per patient
    stats.testingActivity.averageTestsPerPatient = Math.round(
      (stats.testingActivity.totalTests / totalPatients) * 10
    ) / 10;

    return stats;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw new Error('Could not fetch dashboard statistics.');
  }
}

/**
 * Get patient summaries for a doctor (for patient list views)
 * @param doctorId The doctor's UID
 * @returns Array of patient summaries
 */
export async function getPatientSummaries(doctorId: string): Promise<PatientSummary[]> {
  try {
    const patientIds = await getDoctorPatients(doctorId);

    const patientSummaries = await Promise.all(
      patientIds.map(async (patientId) => {
        const [patientInfo, riskAssessment, testHistory, clinicalAssessment] = await Promise.all([
          getPatientById(patientId),
          getPatientRiskAssessment(patientId),
          getPatientTestHistory(patientId),
          getClinicalAssessment(doctorId, patientId),
        ]);

        if (!patientInfo) {
          return null;
        }

        // Find most recent test date
        let lastTestDate: string | null = null;
        if (testHistory.length > 0) {
          // Test history is already sorted by date (most recent first)
          lastTestDate = testHistory[0].date;
        }

        const summary: PatientSummary = {
          id: patientInfo.id,
          fullName: patientInfo.fullName,
          email: patientInfo.email,
          age: riskAssessment?.age || 0,
          gender: riskAssessment?.gender || 'Unknown',
          riskScore: riskAssessment?.riskScore || 0,
          riskLevel: riskAssessment?.riskLevel || 'Low',
          totalTests: testHistory.length,
          lastTestDate,
          hasClinicalAssessment: clinicalAssessment !== null,
          completionStatus: {
            cognitive: riskAssessment?.hasCompletedCognitiveAssessment || false,
            speech: riskAssessment?.hasCompletedSpeechAssessment || false,
            memory: riskAssessment?.hasCompletedMemoryAssessment || false,
            riskAssessment: riskAssessment !== null,
            imageDescription: riskAssessment?.hasCompletedImageDescription || false,
          },
        };

        return summary;
      })
    );

    // Filter out null entries and return
    return patientSummaries.filter((summary): summary is PatientSummary => summary !== null);
  } catch (error) {
    console.error('Error fetching patient summaries:', error);
    throw new Error('Could not fetch patient summaries.');
  }
}