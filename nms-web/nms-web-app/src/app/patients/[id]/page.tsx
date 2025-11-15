// src/app/patients/[id]/page.tsx
'use client';

import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import Breadcrumbs from '@/components/ui/common/Breadcrumbs';
import ScoreCard from '@/components/ui/patients/ScoreCard';
import QuestionnaireModal from '@/components/ui/patients/QuestionnaireModal';
import TestHistory from '@/components/ui/patients/TestHistory';
import Tooltip from '@/components/ui/common/Tooltip';
import { Loader2, Download } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { pdf } from '@react-pdf/renderer';
import { PatientReportPDF } from '@/components/ui/patients/PatientReportPDF';
import { getPatientById, getPatientRiskAssessment, getPatientGameScores, getPatientTestHistory } from '@/lib/firebase/firestore-service';
import { PatientProfile } from '@/lib/mock_data';
import { TestHistoryItem } from '@/types/testHistory';

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

const DetailItem = ({ label, value }: { label: string; value: string | number }) => (
  <div>
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="font-bold text-foreground">{value}</p>
  </div>
);

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth: string): number => {
  if (!dateOfBirth) return 0;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export default function PatientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params Promise using React.use()
  const { id: patientId } = use(params);

  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [questionnaireData, setQuestionnaireData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isQuestionnaireModalOpen, setIsQuestionnaireModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch patient basic info
        const patientData = await getPatientById(patientId);
        if (!patientData) {
          setError('Patient not found');
          return;
        }

        // Fetch risk assessment data
        const riskAssessment = await getPatientRiskAssessment(patientId);

        // Store questionnaire data from risk assessment
        setQuestionnaireData(riskAssessment);

        // Fetch game scores (with fallback to defaults)
        const gameScores = await getPatientGameScores(patientId);

        // Fetch test history
        const testHistory = await getPatientTestHistory(patientId);

        // Calculate age from date of birth
        const age = riskAssessment?.age || calculateAge(patientData.dateOfBirth);

        // Combine all data into PatientProfile
        const patientProfile: PatientProfile = {
          id: patientData.id,
          name: patientData.fullName,
          email: patientData.email,
          age,
          gender: riskAssessment?.gender || 'Female',
          avatarUrl: '/images/Avatar.jpg',
          riskScore: riskAssessment?.riskScore || 0,
          riskLevel: riskAssessment?.riskLevel || 'Low',
          trend: riskAssessment?.trend || 'Stable',
          assessments: {
            cognitive: riskAssessment?.assessments?.cognitive || 0,
            speech: riskAssessment?.assessments?.speech || 0,
          },
          lastCheck: riskAssessment?.lastCheck || new Date().toISOString().split('T')[0],
          nextAppointment: riskAssessment?.nextAppointment || 'Not set',
          smoker: riskAssessment?.smoker || 'No',
          lastPlayed: riskAssessment?.lastPlayed || 'Never',
          gameScores: {
            speech: gameScores?.speech || 0,
            cognitive: gameScores?.cognitive || 0,
            memory: gameScores?.memory || 0,
            avg: gameScores?.avg || 0,
          },
          testHistory: testHistory,
        };

        setPatient(patientProfile);
      } catch (err) {
        console.error('Error fetching patient data:', err);
        setError('Failed to load patient data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  // Handle PDF download
  const handleDownloadReport = async () => {
    if (!patient) return;

    try {
      setIsDownloading(true);

      // Generate PDF document
      const doc = <PatientReportPDF patient={patient} questionnaireData={questionnaireData} />;
      const blob = await pdf(doc).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${patient.name.replace(/\s+/g, '_')}_Medical_Report_${new Date().toISOString().split('T')[0]}.pdf`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading patient data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !patient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-red-500">{error || 'Patient not found'}</p>
          <Link
            href="/patients"
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
          >
            Back to Patients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="w-full space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <Breadcrumbs
          items={[
            { label: 'Patients', href: '/patients' },
            { label: 'Patient Details', href: `/patients` },
            { label: patient.name },
          ]}
        />
      </motion.div>

      {/* Patient Profile Header */}
      <motion.div variants={itemVariants} className="bg-card border rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Image src={patient.avatarUrl} alt={patient.name} width={100} height={100} className="rounded-full mb-4" />
            <h2 className="text-2xl font-bold">{patient.name}</h2>
            <p className="text-muted-foreground">{patient.email}</p>
            <button
              onClick={() => setIsQuestionnaireModalOpen(true)}
              className="mt-4 w-full px-4 py-2 border rounded-lg font-semibold hover:bg-accent transition-colors"
            >
              View Questionnaire
            </button>
          </div>
          <div className="hidden md:flex items-start pt-2">
            <Tooltip content="Download Patient Report">
              <button
                onClick={handleDownloadReport}
                disabled={isDownloading}
                className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
              </button>
            </Tooltip>
          </div>
          <div className="border-l border-border mx-6 hidden md:block"></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-6 flex-1">
            <DetailItem label="Sex" value={patient.gender} />
            <DetailItem label="Age" value={patient.age} />
            <DetailItem label="Speech" value={patient.assessments.speech} />
            <DetailItem label="Smoker" value={patient.smoker} />
            <DetailItem label="Score" value={patient.riskScore} />
            <DetailItem label="Last Played" value={patient.lastPlayed} />
            <DetailItem label="Cognition" value={patient.assessments.cognitive} />
            <DetailItem label="Avg Time" value="60 sec" />
            <DetailItem label="Appointment" value={patient.nextAppointment} />
            <DetailItem label="Patient ID" value={patient.id} />
            <DetailItem label="Memory" value="5" />
          </div>
        </div>
      </motion.div>

      {/* Patient Game Scores */}
      <motion.div variants={itemVariants}>
        <h3 className="text-xl font-bold mb-4">Patient Game Scores</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ScoreCard title="Speech" score={patient.gameScores.speech} maxScore={5} status="Normal" statusColor="#10b981" />
          <ScoreCard title="Cognitive" score={patient.gameScores.cognitive} maxScore={5} status="Normal" statusColor="#10b981" />
          <ScoreCard title="Memory" score={patient.gameScores.memory} maxScore={5} status="Normal" statusColor="#10b981" />
          <ScoreCard title="Avg" score={patient.gameScores.avg} maxScore={5} status="Normal" statusColor="#10b981" />
        </div>
      </motion.div>

      {/* Test History */}
      <motion.div variants={itemVariants}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Test History</h3>
          <p className="text-sm text-muted-foreground">Total Tests: {patient.testHistory.length}</p>
        </div>
        <TestHistory testHistory={patient.testHistory} />
      </motion.div>

      {/* Questionnaire Modal */}
      <QuestionnaireModal
        isOpen={isQuestionnaireModalOpen}
        onClose={() => setIsQuestionnaireModalOpen(false)}
        questionnaireData={questionnaireData}
        patientName={patient.name}
      />
    </motion.div>
  );
}