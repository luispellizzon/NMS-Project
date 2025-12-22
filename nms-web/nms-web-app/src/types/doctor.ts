// src/types/doctor.ts

export interface Doctor {
  id: string; // Firebase Auth UID
  fullName: string;
  email: string;
  role: 'doctor';
  createdAt: Date;
}

export interface DoctorPatientRelationship {
  id: string; // Document ID
  doctorId: string; // Reference to doctor UID
  patientId: string; // Reference to patient UID
  assignedAt: Date;
  notes?: string; // Optional notes about the relationship
}

export interface NewDoctorData {
  fullName: string;
  email: string;
  role: 'doctor';
}
