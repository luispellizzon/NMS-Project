# Firebase Services

This directory contains modular Firebase Firestore service functions organized by domain.

## Structure

```
services/
├── index.ts                    # Main export file - exports all services
├── helpers.ts                  # Shared utility functions
├── doctor-service.ts           # Doctor-related operations
├── patient-service.ts          # Patient-related operations
├── assessment-service.ts       # Assessment and test history operations
└── settings-service.ts         # User settings operations
```

## Usage

### Importing Services

There are two ways to import services:

1. **Direct import from services (recommended for new code):**
   ```typescript
   import { getDoctorProfile, updateDoctorProfile } from '@/lib/firebase/services';
   ```

2. **Legacy import (for backward compatibility):**
   ```typescript
   import { getDoctorProfile, updateDoctorProfile } from '@/lib/firebase/firestore-service';
   ```

Both approaches work identically. The firestore-service.ts file re-exports everything from the services directory for backward compatibility.

## Service Modules

### doctor-service.ts
Handles doctor profile and patient assignment operations:
- `createDoctorProfile(uid, doctorData)` - Create a new doctor profile
- `getDoctorProfile(uid)` - Get doctor profile by UID
- `updateDoctorProfile(uid, updates)` - Update doctor profile
- `assignPatientToDoctor(doctorId, patientId, notes?)` - Assign patient to doctor
- `removePatientFromDoctor(doctorId, patientId)` - Remove patient from doctor
- `getDoctorPatients(doctorId)` - Get all patients assigned to a doctor

### patient-service.ts
Handles patient operations:
- `addPatient(patientData)` - Add a new patient
- `getAllPatients()` - Get all patients
- `getPatientById(patientId)` - Get patient by ID
- `getPatientRiskAssessment(userId)` - Get patient risk assessment
- `getPatientGameScores(patientId)` - Get patient game scores

### assessment-service.ts
Handles all assessment and test history operations:
- `getPatientSpeechAssessments(patientId)` - Get speech assessments
- `getPatientMemoryTests(patientId)` - Get memory tests
- `getPatientCognitiveAssessments(patientId)` - Get cognitive assessments
- `getPatientImageDescriptionAssessments(patientId)` - Get image description assessments
- `getPatientTestHistory(patientId)` - Get unified test history
- `saveClinicalAssessment(assessmentData)` - Save clinical assessment
- `getClinicalAssessment(doctorId, patientId)` - Get clinical assessment

### settings-service.ts
Handles user settings operations:
- `saveNotificationSettings(uid, settings)` - Save notification settings
- `getNotificationSettings(uid)` - Get notification settings
- `saveAccountPreferences(uid, preferences)` - Save account preferences
- `getAccountPreferences(uid)` - Get account preferences

### helpers.ts
Shared utility functions:
- `convertToDateString(dateValue)` - Convert Timestamp/Date/string to ISO string
- `formatDate(dateValue)` - Format date for display
- `formatDuration(seconds)` - Format duration in seconds to human-readable format

## Benefits of This Structure

1. **Better Organization**: Related functions are grouped together by domain
2. **Easier Maintenance**: Smaller files are easier to understand and modify
3. **Better Testability**: Each service can be tested independently
4. **Reduced Cognitive Load**: Developers only need to import what they need
5. **Backward Compatible**: Existing code continues to work without changes
6. **Type Safety**: Full TypeScript support maintained across all modules

## Migration Guide

No migration is required! The existing `firestore-service.ts` file re-exports all functions, so all existing imports will continue to work.

However, for new code, prefer importing directly from `@/lib/firebase/services` for better IDE autocomplete and tree-shaking.