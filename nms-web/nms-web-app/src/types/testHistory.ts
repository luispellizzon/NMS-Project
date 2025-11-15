// src/types/testHistory.ts

import { Timestamp } from 'firebase/firestore';

/**
 * Represents a single task result within a speech assessment
 */
export interface SpeechTaskResult {
  audioUrl: string;
  completedAt: string;
  duration: number;
  transcription: string;
  userScore: number;
}

/**
 * Represents a single task within a speech assessment
 */
export interface SpeechTask {
  expectedAnswers: string[];
  maxScore: number;
  question: string;
  result: SpeechTaskResult;
  taskId: string;
  taskName: string;
}

/**
 * Speech Assessment Document from users/{userId}/speech_assessment/{assessmentId}
 */
export interface SpeechAssessment {
  id: string;
  userId: string;
  aiAnalysis: string;
  completedAt: string;
  startedAt: string;
  isCompleted: boolean;
  totalScore: number;
  currentTaskId: string;
  content: {
    [taskId: string]: SpeechTask;
  };
}

/**
 * Memory Test Document from users/{userId}/memory_tests/{testId}
 */
export interface MemoryTest {
  id: string;
  userId: string;
  completionTime: number; // in seconds
  score: number;
  status: 'completed' | 'in_progress' | 'abandoned';
  testType: string;
  timestamp: string;
  totalQuestions: number;
}

/**
 * Unified test history item for display in the table
 */
export interface TestHistoryItem {
  id: string;
  date: string;
  test: string;
  testType: 'speech' | 'memory';
  timeTaken: string;
  score: string;
  totalPlays?: number;
  rawData?: SpeechAssessment | MemoryTest;
}