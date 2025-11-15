// src/lib/mock-data.ts
import { Timestamp } from 'firebase/firestore'; // Import Firestore Timestamp
import { Patient, RiskLevel, Trend } from '@/types/patient';
import { TestHistoryItem } from '@/types/testHistory';

export const mockPatients: Patient[] = [
  {
    id: 'P001',
    name: 'Jenny Wilson',
    age: 72,
    gender: 'Female',
    avatarUrl: '/images/Avatar.jpg',
    riskScore: 7.6,
    riskLevel: 'High',
    trend: 'Down',
    assessments: { cognitive: 2, speech: 1 },
    lastCheck: '2025-09-28',
    nextAppointment: '2025-11-15',
  },
  {
    id: 'P002',
    name: 'Robert Fox',
    age: 68,
    gender: 'Male',
    avatarUrl: '/images/Avatar.jpg',
    riskScore: 8.1,
    riskLevel: 'High',
    trend: 'Down',
    assessments: { cognitive: 1, speech: 2 },
    lastCheck: '2025-10-01',
    nextAppointment: '2025-11-20',
  },
  {
    id: 'P003',
    name: 'Esther Howard',
    age: 75,
    gender: 'Female',
    avatarUrl: '/images/Avatar.jpg',
    riskScore: 5.5,
    riskLevel: 'Moderate',
    trend: 'Stable',
    assessments: { cognitive: 4, speech: 4 },
    lastCheck: '2025-09-15',
    nextAppointment: '2025-12-01',
  },
  {
    id: 'P004',
    name: 'John Doe',
    age: 65,
    gender: 'Male',
    avatarUrl: '/images/Avatar.jpg',
    riskScore: 9.3,
    riskLevel: 'High',
    trend: 'Down',
    assessments: { cognitive: 2, speech: 1 },
    lastCheck: '2025-10-05',
    nextAppointment: '2026-01-10',
  },
  // ... Add 4 more mock patients to make a total of 8 for pagination
  {
    id: 'P005',
    name: 'Jane Cooper',
    age: 78,
    gender: 'Female',
    avatarUrl: '/images/Avatar.jpg',
    riskScore: 6.8,
    riskLevel: 'Moderate',
    trend: 'Stable',
    assessments: { cognitive: 4, speech: 5 },
    lastCheck: '2025-09-22',
    nextAppointment: '2025-11-18',
  },
  {
    id: 'P006',
    name: 'Wade Warren',
    age: 71,
    gender: 'Male',
    avatarUrl: '/images/Avatar.jpg',
    riskScore: 9.2,
    riskLevel: 'High',
    trend: 'Up',
    assessments: { cognitive: 2, speech: 2 },
    lastCheck: '2025-10-11',
    nextAppointment: '2025-11-05',
  },
  {
    id: 'P007',
    name: 'Annette Black',
    age: 69,
    gender: 'Female',
    avatarUrl: '/images/Avatar.jpg',
    riskScore: 2.1,
    riskLevel: 'Low',
    trend: 'Up',
    assessments: { cognitive: 5, speech: 5 },
    lastCheck: '2025-08-30',
    nextAppointment: '2025-12-12',
  },
  {
    id: 'P008',
    name: 'Jacob Jones',
    age: 74,
    gender: 'Male',
    avatarUrl: '/images/Avatar.jpg',
    riskScore: 4.9,
    riskLevel: 'Moderate',
    trend: 'Stable',
    assessments: { cognitive: 3, speech: 2 },
    lastCheck: '2025-09-29',
    nextAppointment: '2025-11-25',
  },
];

// Data for the Overall Appointments bar chart
export const appointmentsChartData = [
    { month: 'April', assessment: 8, screening: 12, consultation: 5, followUp: 9 },
    { month: 'May', assessment: 10, screening: 15, consultation: 7, followUp: 11 },
    { month: 'June', assessment: 12, screening: 11, consultation: 9, followUp: 13 },
    { month: 'July', assessment: 15, screening: 18, consultation: 6, followUp: 10 },
    { month: 'Aug', assessment: 13, screening: 14, consultation: 8, followUp: 12 },
    { month: 'Sep', assessment: 18, screening: 20, consultation: 10, followUp: 15 },
    { month: 'Oct', assessment: 16, screening: 17, consultation: 11, followUp: 14 },
  ];
  
  // Data for the Appointments Lists
  export type Appointment = {
    id: string;
    patientName: string;
    testName: string;
    date: Date;
    type: 'upcoming' | 'previous';
  };
  
  export const appointmentsListData: Appointment[] = [
    { id: 'apt1', patientName: 'Jim Crow', testName: 'Memory Test', date: new Date('2025-11-14T10:00:00Z'), type: 'upcoming' },
    { id: 'apt2', patientName: 'Robert Fox', testName: 'Cognitive Exam', date: new Date('2025-10-24T10:00:00Z'), type: 'upcoming' },
    { id: 'apt3', patientName: 'Esther Howard', testName: 'Speech Assessment', date: new Date('2025-11-02T14:30:00Z'), type: 'upcoming' },
    { id: 'apt4', patientName: 'Cameron Williamson', testName: 'Memory Recall Test', date: new Date('2025-12-09T09:00:00Z'), type: 'upcoming' },
    { id: 'apt5', patientName: 'Jane Cooper', testName: 'Cognitive Exam', date: new Date('2025-08-09T11:00:00Z'), type: 'previous' },
    { id: 'apt6', patientName: 'Wade Warren', testName: 'Speech Assessment', date: new Date('2025-07-20T16:00:00Z'), type: 'previous' },
    { id: 'apt7', patientName: 'Jacob Jones', testName: 'Memory Test', date: new Date('2025-07-12T08:30:00Z'), type: 'previous' },
    { id: 'apt8', patientName: 'Kristin Watson', testName: 'Attention Assessment', date: new Date('2025-06-16T13:00:00Z'), type: 'previous' },
  ];

  // Data for the Score Range Radar Chart
export const scoreRangeData = [
    { subject: 'Memory', score: 85, fullMark: 100 },
    { subject: 'Cognition', score: 92, fullMark: 100 },
    { subject: 'Speech', score: 78, fullMark: 100 },
    { subject: 'Questionnaire', score: 65, fullMark: 100 },
    { subject: 'Attention', score: 88, fullMark: 100 },
    { subject: 'Execution', score: 72, fullMark: 100 },
  ];
  
  // Data for the Patients Donut Chart
  export const patientsDistributionData = [
    { name: 'Men', value: 12, fill: '#8884d8' },
    { name: 'Women', value: 20, fill: '#82ca9d' },
  ];
  
  // Data for the Avg Risk Assessment Area Chart
  export const avgRiskAssessmentData = [
    { month: 'June', score: 65 },
    { month: 'July', score: 68 },
    { month: 'Aug', score: 70 },
    { month: 'Sep', score: 78 },
    { month: 'Oct', score: 75 },
    { month: 'Nov', score: 80 },
  ];

// Data for the Geographic Distribution Globe
export type PatientLocation = {
  lat: number;
  lon: number;
  city: string;
  patientCount: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  color: string;
  scale: number;
};

export const patientLocations: PatientLocation[] = [
  { lat: 51.5074, lon: -0.1278, city: 'London', patientCount: 28, riskLevel: 'Medium', color: '#3b82f6', scale: 1.5 },
  { lat: 40.7128, lon: -74.0060, city: 'New York', patientCount: 45, riskLevel: 'High', color: '#ef4444', scale: 1.2 },
  { lat: 35.6895, lon: 139.6917, city: 'Tokyo', patientCount: 32, riskLevel: 'Low', color: '#10b981', scale: 1.0 },
  { lat: -33.8688, lon: 151.2093, city: 'Sydney', patientCount: 19, riskLevel: 'Low', color: '#f59e0b', scale: 1.3 },
  { lat: -23.5505, lon: -46.6333, city: 'São Paulo', patientCount: 22, riskLevel: 'Medium', color: '#8b5cf6', scale: 1.1 },
  { lat: 34.0522, lon: -118.2437, city: 'Los Angeles', patientCount: 38, riskLevel: 'High', color: '#ef4444', scale: 0.9 },
  { lat: 48.8566, lon: 2.3522, city: 'Paris', patientCount: 15, riskLevel: 'Low', color: '#3b82f6', scale: 0.8 },
];

// Data for the Avg Scores display
export const avgScoresData = {
  mainScore: 5,
  mainUnit: 'pts',
  mainLabel: 'Summary',
  subScores: [
    { label: 'Speech', value: 4.8, color: '#8b5cf6' },
    { label: 'Cognition', value: 5.2, color: '#3b82f6' },
    { label: 'Memory', value: 4.9, color: '#10b981' },
  ],
};

export type PatientProfile = Patient & {
  email: string;
  smoker: 'Yes' | 'No';
  lastPlayed: string;
  gameScores: {
    speech: number;
    cognitive: number;
    memory: number;
    avg: number;
  };
  testHistory: TestHistoryItem[];
};

export const mockPatientProfile: PatientProfile = {
  // Inherit from mockPatients
  id: 'P001',
  name: 'Jenny Wilson',
  age: 72,
  gender: 'Female',
  avatarUrl: '/images/Avatar.jpg',
  riskScore: 7.6,
  riskLevel: 'High',
  trend: 'Up',
  assessments: { cognitive: 4, speech: 3 },
  lastCheck: '2025-09-28',
  nextAppointment: '2025-11-15',
  // New detailed fields
  email: 'jen.wilson@example.com',
  smoker: 'No',
  lastPlayed: '2025-10-28',
  gameScores: {
    speech: 5,
    cognitive: 5,
    memory: 5,
    avg: 5,
  },
  testHistory: [
    { id: 'h1', date: '2025-10-28', test: 'Cognitive Recall', testType: 'memory', timeTaken: '45 sec', score: '5/5', totalPlays: 3 },
    { id: 'h2', date: '2025-10-21', test: 'Verbal Fluency', testType: 'speech', timeTaken: '52 sec', score: '4/5', totalPlays: 2 },
    { id: 'h3', date: '2025-10-14', test: 'Pattern Recognition', testType: 'memory', timeTaken: '38 sec', score: '5/5', totalPlays: 4 },
    { id: 'h4', date: '2025-10-07', test: 'Cognitive Recall', testType: 'memory', timeTaken: '48 sec', score: '4/5', totalPlays: 3 },
  ],
};