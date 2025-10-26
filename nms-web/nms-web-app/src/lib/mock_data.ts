// src/lib/mock-data.ts
import { Timestamp } from 'firebase/firestore'; // Import Firestore Timestamp

// Updated Type to match our Firestore model
export type NewsArticle = {
  id: string; // Document ID from Firestore
  topic: string;
  title: string;
  sourceUrl: string; // Link to the original article
  publishedDate: Timestamp; // Use Firestore Timestamp for proper sorting
  readTime: string;
  agentSummary: string; // The full summary from the AI agent
};

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
  
// Data for the News Feed
export const richNewsFeedData: NewsArticle[] = [
  {
    id: 'news1',
    topic: 'Cognitive Health',
    title: 'New Study on Ginkgo Biloba Shows Promising Results for Memory Support',
    sourceUrl: 'https://www.medicalnewstoday.com/articles/ginkgo-biloba-benefits',
    publishedDate: Timestamp.fromDate(new Date('2025-10-20T10:00:00Z')),
    readTime: '5 min',
    agentSummary: 'A comprehensive 5-year, double-blind study involving 1,200 participants indicates that daily supplementation with Ginkgo Biloba extract can provide statistically significant support for short-term memory recall and executive function in adults over 60. The mechanism is believed to be related to improved cerebral blood flow. No major adverse effects were reported.'
  },
  {
    id: 'news2',
    topic: 'Neurology',
    title: 'AI in Early Diagnosis of Alzheimer\'s: Retinal Scan Analysis',
    sourceUrl: 'https://www.nature.com/articles/s41598-023-34567-x',
    publishedDate: Timestamp.fromDate(new Date('2025-10-19T15:30:00Z')),
    readTime: '8 min',
    agentSummary: 'Researchers have developed a new deep learning model that can predict the likelihood of Alzheimer\'s disease with 92% accuracy by analyzing retinal fundus images. The model identifies subtle microvascular changes in the retina that are correlated with the buildup of amyloid-beta plaques in the brain, offering a non-invasive and cost-effective screening method.'
  },
  {
    id: 'news3',
    topic: 'Neurology',
    title: 'AI in Early Diagnosis of Alzheimer\'s: Retinal Scan Analysis',
    sourceUrl: 'https://www.nature.com/articles/s41598-023-34567-x',
    publishedDate: Timestamp.fromDate(new Date('2025-10-19T15:30:00Z')),
    readTime: '8 min',
    agentSummary: 'Researchers have developed a new deep learning model that can predict the likelihood of Alzheimer\'s disease with 92% accuracy by analyzing retinal fundus images. The model identifies subtle microvascular changes in the retina that are correlated with the buildup of amyloid-beta plaques in the brain, offering a non-invasive and cost-effective screening method.'
  },
  // Add more articles as needed
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