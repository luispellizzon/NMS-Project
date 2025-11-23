// src/lib/firebase/services/assessment-service.ts
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config';
import { ClinicalAssessment, ClinicalAssessmentData } from '@/types/patient';
import { SpeechAssessment, MemoryTest, TestHistoryItem } from '@/types/testHistory';
import { convertToDateString, formatDate, formatDuration } from './helpers';

/**
 * Gets a patient's speech assessments from subcollection.
 * @param patientId The patient's UID.
 * @returns Array of speech assessments.
 */
export const getPatientSpeechAssessments = async (patientId: string): Promise<SpeechAssessment[]> => {
  try {
    const speechAssessmentsRef = collection(db, 'users', patientId, 'speech_assessment');
    const q = query(speechAssessmentsRef, orderBy('completedAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        aiAnalysis: data.aiAnalysis,
        completedAt: data.completedAt,
        startedAt: data.startedAt,
        isCompleted: data.isCompleted,
        totalScore: data.totalScore,
        currentTaskId: data.currentTaskId,
        content: data.content,
      } as SpeechAssessment;
    });
  } catch (error) {
    console.error("Error fetching patient speech assessments:", error);
    return [];
  }
};

/**
 * Gets a patient's memory tests from subcollection.
 * @param patientId The patient's UID.
 * @returns Array of memory tests.
 */
export const getPatientMemoryTests = async (patientId: string): Promise<MemoryTest[]> => {
  try {
    const memoryTestsRef = collection(db, 'users', patientId, 'memory_tests');
    const q = query(memoryTestsRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        completionTime: data.completionTime,
        score: data.score,
        status: data.status,
        testType: data.testType,
        timestamp: data.timestamp,
        totalQuestions: data.totalQuestions,
      } as MemoryTest;
    });
  } catch (error) {
    console.error("Error fetching patient memory tests:", error);
    return [];
  }
};

/**
 * Gets a patient's cognitive assessments from subcollection.
 * @param patientId The patient's UID.
 * @returns Array of cognitive assessments.
 */
export const getPatientCognitiveAssessments = async (patientId: string): Promise<any[]> => {
  try {
    const cognitiveAssessmentsRef = collection(db, 'users', patientId, 'cognitive_assessments');
    const q = query(cognitiveAssessmentsRef, orderBy('time', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        FinalScore: data.FinalScore,
        State: data.State,
        time: data.time,
        tests: data.tests || {},
      };
    });
  } catch (error) {
    console.error("Error fetching patient cognitive assessments:", error);
    return [];
  }
};

/**
 * Gets a patient's image description assessments from subcollection.
 * @param patientId The patient's UID.
 * @returns Array of image description assessments.
 */
export const getPatientImageDescriptionAssessments = async (patientId: string): Promise<any[]> => {
  try {
    const imageDescriptionRef = collection(db, 'users', patientId, 'image_description_assessment');
    const q = query(imageDescriptionRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        testType: data.testType,
        status: data.status,
        timestamp: data.timestamp,
        duration: data.duration,
        audioUrl: data.audioUrl,
        transcription: data.transcription,
        aiAnalysis: data.aiAnalysis,
        score: data.score,
      };
    });
  } catch (error) {
    console.error("Error fetching patient image description assessments:", error);
    return [];
  }
};

/**
 * Gets a patient's complete test history (speech, memory, cognitive, and image description assessments).
 * @param patientId The patient's UID.
 * @returns Array of unified test history items.
 */
export const getPatientTestHistory = async (patientId: string): Promise<TestHistoryItem[]> => {
  try {
    // Fetch all assessment types in parallel
    const [speechAssessments, memoryTests, cognitiveAssessments, imageDescriptionAssessments] = await Promise.all([
      getPatientSpeechAssessments(patientId),
      getPatientMemoryTests(patientId),
      getPatientCognitiveAssessments(patientId),
      getPatientImageDescriptionAssessments(patientId),
    ]);

    // Convert speech assessments to unified format
    const speechHistory: TestHistoryItem[] = speechAssessments
      .filter(assessment => assessment.isCompleted)
      .map(assessment => {
        // Calculate total duration from all tasks
        const totalDuration = Object.values(assessment.content).reduce(
          (sum, task) => {
            // Handle different result types
            if (typeof task.result === 'object' && task.result !== null) {
              return sum + (task.result.duration || 0);
            }
            return sum;
          },
          0
        );
        const durationInSeconds = Math.round(totalDuration / 1000);

        // Calculate max score from all tasks
        const maxScore = Object.values(assessment.content).reduce(
          (sum, task) => sum + (task.maxScore || 0),
          0
        );

        return {
          id: assessment.id,
          date: formatDate(assessment.completedAt),
          test: 'Speech Assessment',
          testType: 'speech' as const,
          timeTaken: formatDuration(durationInSeconds),
          score: `${assessment.totalScore}/${maxScore}`,
          rawData: assessment,
        };
      });

    // Convert memory tests to unified format
    const memoryHistory: TestHistoryItem[] = memoryTests
      .filter(test => test.status === 'completed')
      .map(test => ({
        id: test.id,
        date: formatDate(test.timestamp),
        test: test.testType === 'memory_mcq' ? 'Memory Test (MCQ)' : 'Memory Test',
        testType: 'memory' as const,
        timeTaken: formatDuration(test.completionTime),
        score: `${test.score}/${test.totalQuestions}`,
        rawData: test,
      }));

    // Convert cognitive assessments to unified format
    const cognitiveHistory: TestHistoryItem[] = cognitiveAssessments
      .filter(assessment => assessment.State === 'completed')
      .map(assessment => {
        // Calculate total duration from all tests if available
        const tests = assessment.tests || {};
        const totalDuration = Object.values(tests).reduce(
          (sum: number, test: any) => sum + (test.duration || 0),
          0
        );

        return {
          id: assessment.id,
          date: formatDate(assessment.time),
          test: 'Cognitive Assessment',
          testType: 'cognitive' as const,
          timeTaken: totalDuration > 0 ? formatDuration(totalDuration) : 'N/A',
          score: `${assessment.FinalScore}/100`,
          rawData: assessment,
        };
      });

    // Convert image description assessments to unified format
    const imageDescriptionHistory: TestHistoryItem[] = imageDescriptionAssessments
      .filter(assessment => assessment.status === 'completed')
      .map(assessment => ({
        id: assessment.id,
        date: formatDate(assessment.timestamp),
        test: 'Image Description Test',
        testType: 'image_description' as const,
        timeTaken: formatDuration(assessment.duration),
        score: assessment.score !== null ? `${assessment.score}/100` : 'N/A',
        rawData: assessment,
      }));

    // Combine all history types and sort by date (most recent first)
    const allHistory = [...speechHistory, ...memoryHistory, ...cognitiveHistory, ...imageDescriptionHistory];
    allHistory.sort((a, b) => {
      let dateA: Date;
      let dateB: Date;

      // Get date based on test type - convert to Date using helper
      if (a.testType === 'speech') {
        const dateValue = (a.rawData as SpeechAssessment).completedAt;
        dateA = new Date(convertToDateString(dateValue));
      } else if (a.testType === 'memory') {
        const dateValue = (a.rawData as MemoryTest).timestamp;
        dateA = new Date(convertToDateString(dateValue));
      } else if (a.testType === 'cognitive') {
        const dateValue = (a.rawData as any).time;
        dateA = new Date(convertToDateString(dateValue));
      } else {
        const dateValue = (a.rawData as any).timestamp;
        dateA = new Date(convertToDateString(dateValue));
      }

      if (b.testType === 'speech') {
        const dateValue = (b.rawData as SpeechAssessment).completedAt;
        dateB = new Date(convertToDateString(dateValue));
      } else if (b.testType === 'memory') {
        const dateValue = (b.rawData as MemoryTest).timestamp;
        dateB = new Date(convertToDateString(dateValue));
      } else if (b.testType === 'cognitive') {
        const dateValue = (b.rawData as any).time;
        dateB = new Date(convertToDateString(dateValue));
      } else {
        const dateValue = (b.rawData as any).timestamp;
        dateB = new Date(convertToDateString(dateValue));
      }

      return dateB.getTime() - dateA.getTime();
    });

    return allHistory;
  } catch (error) {
    console.error("Error fetching patient test history:", error);
    return [];
  }
};

/**
 * Saves or updates a clinical assessment for a patient in doctor's subcollection.
 * @param assessmentData The clinical assessment data.
 * @returns The patient ID (document ID).
 */
export const saveClinicalAssessment = async (
  assessmentData: ClinicalAssessmentData
): Promise<string> => {
  try {
    const { patientId, doctorId, riskLevel, notes } = assessmentData;

    // Store assessment in doctors/{doctorId}/clinical_assessments/{patientId}
    // Using patientId as the document ID ensures one assessment per patient per doctor
    const assessmentDocRef = doc(
      db,
      'doctors',
      doctorId,
      'clinical_assessments',
      patientId
    );
    const assessmentSnapshot = await getDoc(assessmentDocRef);

    const assessmentPayload = {
      patientId,
      riskLevel,
      notes: notes || null,
      lastUpdated: serverTimestamp(),
    };

    if (assessmentSnapshot.exists()) {
      // Update existing assessment
      await setDoc(assessmentDocRef, assessmentPayload, { merge: true });
    } else {
      // Create new assessment
      await setDoc(assessmentDocRef, {
        ...assessmentPayload,
        timestamp: serverTimestamp(),
      });
    }

    return patientId;
  } catch (error) {
    console.error("Error saving clinical assessment:", error);
    throw new Error("Could not save clinical assessment.");
  }
};

/**
 * Gets a clinical assessment for a specific patient from doctor's subcollection.
 * @param doctorId The doctor's UID.
 * @param patientId The patient's UID.
 * @returns Clinical assessment or null if not found.
 */
export const getClinicalAssessment = async (
  doctorId: string,
  patientId: string
): Promise<ClinicalAssessment | null> => {
  try {
    const assessmentDocRef = doc(
      db,
      'doctors',
      doctorId,
      'clinical_assessments',
      patientId
    );
    const assessmentSnapshot = await getDoc(assessmentDocRef);

    if (assessmentSnapshot.exists()) {
      const data = assessmentSnapshot.data();
      return {
        id: assessmentSnapshot.id,
        patientId: data.patientId,
        doctorId: doctorId,
        riskLevel: data.riskLevel,
        notes: data.notes,
        timestamp: data.timestamp?.toDate() || new Date(),
        lastUpdated: data.lastUpdated?.toDate(),
      } as ClinicalAssessment;
    }

    return null;
  } catch (error) {
    console.error("Error fetching clinical assessment:", error);
    return null;
  }
};