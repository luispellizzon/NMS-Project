// src/lib/mock_data.ts
// This file contains mock data for appointments functionality only
// All other data (patients, locations, profiles, etc.) comes from Firebase

/**
 * Appointment Type
 */
export type Appointment = {
  id: string;
  patientName: string;
  testName: string;
  date: Date;
  type: 'upcoming' | 'previous';
};

/**
 * Data for the Overall Appointments bar chart
 */
export const appointmentsChartData = [
  { month: 'April', assessment: 8, screening: 12, consultation: 5, followUp: 9 },
  { month: 'May', assessment: 10, screening: 15, consultation: 7, followUp: 11 },
  { month: 'June', assessment: 12, screening: 11, consultation: 9, followUp: 13 },
  { month: 'July', assessment: 15, screening: 18, consultation: 6, followUp: 10 },
  { month: 'Aug', assessment: 13, screening: 14, consultation: 8, followUp: 12 },
  { month: 'Sep', assessment: 18, screening: 20, consultation: 10, followUp: 15 },
  { month: 'Oct', assessment: 16, screening: 17, consultation: 11, followUp: 14 },
];

/**
 * Data for the Appointments Lists
 */
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