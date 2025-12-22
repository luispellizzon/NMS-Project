// src/components/ui/patients/PatientReportPDF.tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { PatientProfile } from '@/types/patient';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1e40af',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 3,
  },
  section: {
    marginTop: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e40af',
    backgroundColor: '#eff6ff',
    padding: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingVertical: 4,
  },
  label: {
    width: '40%',
    fontSize: 10,
    color: '#475569',
    fontWeight: 'bold',
  },
  value: {
    width: '60%',
    fontSize: 10,
    color: '#1e293b',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  gridItem: {
    width: '50%',
    marginBottom: 8,
  },
  riskBadge: {
    padding: 4,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
  },
  riskHigh: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  riskModerate: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  riskLow: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 6,
    fontWeight: 'bold',
    fontSize: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    fontSize: 9,
  },
  tableCol1: {
    width: '20%',
  },
  tableCol2: {
    width: '30%',
  },
  tableCol3: {
    width: '15%',
  },
  tableCol4: {
    width: '15%',
  },
  tableCol5: {
    width: '20%',
  },
  scoreCard: {
    width: '25%',
    padding: 8,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  scoreTitle: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
});

interface QuestionnaireData {
  age?: number;
  gender?: string;
  alcohol_use?: string;
  chronic_health_conditions?: string;
  depression_status?: string;
  diabetic?: string;
  dominant_hand?: string;
  education_level?: string;
  family_history?: string;
  genetic?: string;
  medication_history?: string;
  nutrition_diet?: string;
  physical_activity?: string;
  sleep_quality?: string;
  smoking_status?: string;
  weight?: number;
}

interface PatientReportPDFProps {
  patient: PatientProfile;
  questionnaireData: QuestionnaireData | null;
}

export const PatientReportPDF = ({ patient, questionnaireData }: PatientReportPDFProps) => {
  const getRiskBadgeStyle = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'high':
        return styles.riskHigh;
      case 'moderate':
        return styles.riskModerate;
      case 'low':
        return styles.riskLow;
      default:
        return styles.riskLow;
    }
  };

  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Patient Medical Report</Text>
          <Text style={styles.subtitle}>Neurological Monitoring System</Text>
          <Text style={styles.subtitle}>Generated on: {formatDate()}</Text>
        </View>

        {/* Patient Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Patient Name:</Text>
                <Text style={styles.value}>{patient.name}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Patient ID:</Text>
                <Text style={styles.value}>{patient.id}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{patient.email}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Age:</Text>
                <Text style={styles.value}>{patient.age} years</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Gender:</Text>
                <Text style={styles.value}>{patient.gender}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Last Check:</Text>
                <Text style={styles.value}>{patient.lastCheck}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Risk Assessment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk Assessment Summary</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Overall Risk Score:</Text>
            <Text style={styles.value}>{patient.riskScore}/10</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Risk Level:</Text>
            <View style={[styles.riskBadge, getRiskBadgeStyle(patient.riskLevel)]}>
              <Text>{patient.riskLevel}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Trend:</Text>
            <Text style={styles.value}>{patient.trend}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Cognitive Assessment:</Text>
            <Text style={styles.value}>{patient.assessments.cognitive}/5</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Speech Assessment:</Text>
            <Text style={styles.value}>{patient.assessments.speech}/5</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Next Appointment:</Text>
            <Text style={styles.value}>{patient.nextAppointment}</Text>
          </View>
        </View>

        {/* Game Scores */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assessment Scores</Text>
          <View style={styles.grid}>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreTitle}>Speech</Text>
              <Text style={styles.scoreValue}>{patient.gameScores.speech}/5</Text>
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreTitle}>Cognitive</Text>
              <Text style={styles.scoreValue}>{patient.gameScores.cognitive}/5</Text>
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreTitle}>Memory</Text>
              <Text style={styles.scoreValue}>{patient.gameScores.memory}/5</Text>
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreTitle}>Average</Text>
              <Text style={styles.scoreValue}>{patient.gameScores.avg}/5</Text>
            </View>
          </View>
        </View>

        {/* Questionnaire Data */}
        {questionnaireData && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Demographics & Lifestyle</Text>
              {questionnaireData.weight !== undefined && (
                <View style={styles.row}>
                  <Text style={styles.label}>Weight:</Text>
                  <Text style={styles.value}>{questionnaireData.weight} lbs</Text>
                </View>
              )}
              {questionnaireData.dominant_hand && (
                <View style={styles.row}>
                  <Text style={styles.label}>Dominant Hand:</Text>
                  <Text style={styles.value}>{questionnaireData.dominant_hand}</Text>
                </View>
              )}
              {questionnaireData.education_level && (
                <View style={styles.row}>
                  <Text style={styles.label}>Education Level:</Text>
                  <Text style={styles.value}>{questionnaireData.education_level}</Text>
                </View>
              )}
              {questionnaireData.smoking_status && (
                <View style={styles.row}>
                  <Text style={styles.label}>Smoking Status:</Text>
                  <Text style={styles.value}>{questionnaireData.smoking_status}</Text>
                </View>
              )}
              {questionnaireData.alcohol_use && (
                <View style={styles.row}>
                  <Text style={styles.label}>Alcohol Use:</Text>
                  <Text style={styles.value}>{questionnaireData.alcohol_use}</Text>
                </View>
              )}
              {questionnaireData.physical_activity && (
                <View style={styles.row}>
                  <Text style={styles.label}>Physical Activity:</Text>
                  <Text style={styles.value}>{questionnaireData.physical_activity}</Text>
                </View>
              )}
              {questionnaireData.sleep_quality && (
                <View style={styles.row}>
                  <Text style={styles.label}>Sleep Quality:</Text>
                  <Text style={styles.value}>{questionnaireData.sleep_quality}</Text>
                </View>
              )}
              {questionnaireData.nutrition_diet && (
                <View style={styles.row}>
                  <Text style={styles.label}>Nutrition & Diet:</Text>
                  <Text style={styles.value}>{questionnaireData.nutrition_diet}</Text>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Health Conditions</Text>
              {questionnaireData.chronic_health_conditions && (
                <View style={styles.row}>
                  <Text style={styles.label}>Chronic Conditions:</Text>
                  <Text style={styles.value}>{questionnaireData.chronic_health_conditions}</Text>
                </View>
              )}
              {questionnaireData.diabetic && (
                <View style={styles.row}>
                  <Text style={styles.label}>Diabetic:</Text>
                  <Text style={styles.value}>{questionnaireData.diabetic === '1' ? 'Yes' : 'No'}</Text>
                </View>
              )}
              {questionnaireData.depression_status && (
                <View style={styles.row}>
                  <Text style={styles.label}>Depression Status:</Text>
                  <Text style={styles.value}>{questionnaireData.depression_status}</Text>
                </View>
              )}
              {questionnaireData.medication_history && (
                <View style={styles.row}>
                  <Text style={styles.label}>Medication History:</Text>
                  <Text style={styles.value}>{questionnaireData.medication_history}</Text>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Family & Genetic History</Text>
              {questionnaireData.family_history && (
                <View style={styles.row}>
                  <Text style={styles.label}>Family History:</Text>
                  <Text style={styles.value}>{questionnaireData.family_history}</Text>
                </View>
              )}
              {questionnaireData.genetic && (
                <View style={styles.row}>
                  <Text style={styles.label}>Genetic Markers:</Text>
                  <Text style={styles.value}>{questionnaireData.genetic}</Text>
                </View>
              )}
            </View>
          </>
        )}

        {/* Test History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test History</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCol1}>Date</Text>
              <Text style={styles.tableCol2}>Test Name</Text>
              <Text style={styles.tableCol3}>Type</Text>
              <Text style={styles.tableCol4}>Time Taken</Text>
              <Text style={styles.tableCol5}>Score</Text>
            </View>
            {patient.testHistory.map((test) => (
              <View key={test.id} style={styles.tableRow}>
                <Text style={styles.tableCol1}>{test.date}</Text>
                <Text style={styles.tableCol2}>{test.test}</Text>
                <Text style={styles.tableCol3}>{test.testType}</Text>
                <Text style={styles.tableCol4}>{test.timeTaken}</Text>
                <Text style={styles.tableCol5}>{test.score}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            This report is confidential and intended for medical professionals only.
          </Text>
          <Text>
            NMS - Neurological Monitoring System | Generated on {formatDate()}
          </Text>
        </View>
      </Page>
    </Document>
  );
};