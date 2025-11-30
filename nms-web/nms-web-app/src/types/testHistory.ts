// src/types/testHistory.ts

import { Timestamp } from 'firebase/firestore';

/**
 * Represents a single task result within a speech assessment
 */
export interface SpeechTaskResult {
  audioUrl?: string;
  completedAt?: string;
  duration?: number;
  transcription?: string;
  userScore?: number;
}

/**
 * Represents a single task within a speech assessment
 */
export interface SpeechTask {
  expectedAnswers: string[];
  maxScore: number;
  question: string;
  result: SpeechTaskResult | string | null;
  taskId: string;
  taskName: string;
}

/**
 * Speech Assessment Document from users/{userId}/speech_assessment/{assessmentId}
 * This matches the new Firebase structure
 */
export interface SpeechAssessment {
  id: string;
  userId: string;
  aiAnalysis: string | null;
  completedAt: string | Timestamp | Date;
  startedAt: string | Timestamp | Date;
  isCompleted: boolean;
  totalScore: number;
  currentTaskId: string;
  content: {
    [taskId: string]: SpeechTask;
  };
}

/**
 * Memory Test Document from users/{userId}/memory_tests/{testId}
 * This matches the new Firebase structure
 */
export interface MemoryTest {
  id: string;
  userId: string;
  completionTime: number; // in seconds
  score: number;
  status: 'completed' | 'in_progress' | 'abandoned';
  testType: string;
  totalScore?: number;
  timestamp: string | Timestamp | Date;
  totalQuestions: number;
}

/**
 * Image Description Assessment Document from users/{userId}/image_description_assessment/{assessmentId}
 * This matches the new Firebase structure
 */
export interface ImageDescriptionAssessment {
  id: string;
  userId: string;
  testType: string;
  status: string;
  timestamp: string | Timestamp | Date;
  duration: number;
  audioUrl: string;
  transcription: string;
  aiAnalysis: string;
  score: number | null;
}

/**
 * Cognitive Assessment Test
 */
export interface CognitiveTest {
  id: string;
  userId: string;
  taskType: string;
  timestamp: string | Timestamp | Date;
  passed: boolean;
  score: number;
  duration: number;
  imageUrl?: string;
  boundingBoxArea?: number;
  strokeCount?: number;
  totalLength?: number;
  touchSequence?: string[];
}

/**
 * Cognitive Assessment Document from users/{userId}/cognitive_assessments/{assessmentId}
 * This matches the new Firebase structure
 */
export interface CognitiveAssessment {
  id: string;
  FinalScore: number;
  State: string;
  time: string | Timestamp | Date;
  tests?: {
    [testId: string]: CognitiveTest;
  };
}

/**
 * Unified test history item for display in the table
 */
export interface TestHistoryItem {
  id: string;
  date: string;
  test: string;
  testType: 'speech' | 'memory' | 'cognitive' | 'image_description';
  timeTaken: string;
  score: string;
  totalPlays?: number;
  rawData?: SpeechAssessment | MemoryTest | CognitiveAssessment | ImageDescriptionAssessment;
}