// src/app/patients/[id]/page.tsx
'use client';

import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import Breadcrumbs from '@/components/ui/common/Breadcrumbs';
import ScoreCard from '@/components/ui/patients/ScoreCard';
import QuestionnaireModal from '@/components/ui/patients/QuestionnaireModal';
import TestHistory from '@/components/ui/patients/TestHistory';
import ClinicalAssessment from '@/components/ui/patients/ClinicalAssessment';
import Tooltip from '@/components/ui/common/Tooltip';
import { Loader2, Download } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { pdf } from '@react-pdf/renderer';
import { PatientReportPDF } from '@/components/ui/patients/PatientReportPDF';
import { getPatientById, getPatientRiskAssessment, getPatientTestHistory } from '@/lib/firebase/firestore-service';
import { PatientProfile } from '@/types/patient';
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

const DetailItem = ({ label, value }: { label: string; value: string | number }) => {
  // Handle NaN values
  const displayValue = typeof value === 'number' && isNaN(value) ? 'N/A' : value;

  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-bold text-foreground">{displayValue}</p>
    </div>
  );
};

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth: string): number => {
  if (!dateOfBirth) return 0;

  try {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);

    // Check if birthDate is valid
    if (isNaN(birthDate.getTime())) {
      return 0;
    }

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Ensure age is valid
    return isNaN(age) || age < 0 ? 0 : age;
  } catch (error) {
    console.error('Error calculating age:', error);
    return 0;
  }
};

// Helper function to calculate status and color based on score percentage
const getScoreStatus = (score: number, maxScore: number): { status: string; color: string } => {
  const percentage = (score / maxScore) * 100;

  if (percentage >= 80) {
    return { status: 'Excellent', color: '#10b981' }; // Green
  } else if (percentage >= 60) {
    return { status: 'Good', color: '#3b82f6' }; // Blue
  } else if (percentage >= 40) {
    return { status: 'Fair', color: '#f59e0b' }; // Orange
  } else {
    return { status: 'Needs Attention', color: '#ef4444' }; // Red
  }
};

// Helper function to get latest scores from test history
const getLatestScores = (testHistory: TestHistoryItem[]) => {
  const latestSpeech = testHistory.find(item => item.testType === 'speech');
  const latestMemory = testHistory.find(item => item.testType === 'memory');

  let speechScore = 0;
  let speechMaxScore = 5;
  let memoryScore = 0;
  let memoryMaxScore = 5;

  if (latestSpeech) {
    const [score, max] = latestSpeech.score.split('/').map(Number);
    speechScore = score || 0;
    speechMaxScore = max || 5;
  }

  if (latestMemory) {
    const [score, max] = latestMemory.score.split('/').map(Number);
    memoryScore = score || 0;
    memoryMaxScore = max || 5;
  }

  // Calculate cognitive score as average of speech and memory (normalized to 5)
  const speechNormalized = speechMaxScore > 0 ? (speechScore / speechMaxScore) * 5 : 0;
  const memoryNormalized = memoryMaxScore > 0 ? (memoryScore / memoryMaxScore) * 5 : 0;
  const cognitiveScore = (speechNormalized + memoryNormalized) / 2;

  // Calculate average of all scores
  const avgScore = (speechNormalized + memoryNormalized + cognitiveScore) / 3;

  return {
    speech: { score: speechScore, maxScore: speechMaxScore },
    memory: { score: memoryScore, maxScore: memoryMaxScore },
    cognitive: { score: Math.round(cognitiveScore * 10) / 10, maxScore: 5 },
    avg: { score: Math.round(avgScore * 10) / 10, maxScore: 5 },
  };
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

        // Fetch test history (contains all scores from speech assessments and memory tests)
        const testHistory = await getPatientTestHistory(patientId);

        // Calculate age from date of birth
        const age = riskAssessment?.age || calculateAge(patientData.dateOfBirth);

        // Calculate risk score from MMSE score (0-30 scale)
        const mmseScore = patientData.mmseScore || 0;
        const riskScore = mmseScore > 0 ? Math.round((30 - mmseScore) / 3 * 10) / 10 : 0;

        // Map dementiaRisk string to RiskLevel enum
        let riskLevel: 'High' | 'Moderate' | 'Low' = 'Low';
        const dementiaRisk = patientData.dementiaRisk || '';

        if (dementiaRisk.includes('High') || dementiaRisk.includes('Severe') || mmseScore < 18) {
          riskLevel = 'High';
        } else if (dementiaRisk.includes('Moderate') || dementiaRisk.includes('Mild') || mmseScore < 24) {
          riskLevel = 'Moderate';
        } else {
          riskLevel = 'Low';
        }

        // Calculate cognitive and speech scores from MMSE (0-30 -> 0-5 scale)
        const cognitiveScore = mmseScore > 0 ? Math.round((mmseScore / 30) * 5 * 10) / 10 : 0;
        const speechScore = cognitiveScore;

        // Combine all data into PatientProfile
        const patientProfile: PatientProfile = {
          id: patientData.id,
          name: patientData.fullName,
          email: patientData.email,
          // Age and gender from risk assessment questionnaire
          age,
          gender: riskAssessment?.gender || 'Female',
          avatarUrl: '/images/Avatar.jpg',
          // Risk score calculated from MMSE
          riskScore,
          riskLevel,
          trend: patientData.trend || 'Stable',
          // Assessment scores derived from MMSE
          assessments: {
            cognitive: cognitiveScore,
            speech: speechScore,
          },
          lastCheck: new Date().toISOString().split('T')[0],
          nextAppointment: 'Not set',
          // Additional fields from risk assessment
          smoker: riskAssessment?.smoking_status === 'Current smoker' ? 'Yes' : 'No',
          lastPlayed: 'Never', // This should come from game activity tracking
          gameScores: {
            // Scores are now calculated from test history in real-time
            speech: 0,
            cognitive: 0,
            memory: 0,
            avg: 0,
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

  // Get latest scores from test history
  const latestScores = getLatestScores(patient.testHistory);

  // Calculate status and color for each score
  const speechStatus = getScoreStatus(latestScores.speech.score, latestScores.speech.maxScore);
  const memoryStatus = getScoreStatus(latestScores.memory.score, latestScores.memory.maxScore);
  const cognitiveStatus = getScoreStatus(latestScores.cognitive.score, latestScores.cognitive.maxScore);
  const avgStatus = getScoreStatus(latestScores.avg.score, latestScores.avg.maxScore);

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
          {/* Left Section: Avatar, Name, Actions */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-[240px]">
            <div className="flex items-start gap-26 mb-4">
              <Image
                src={patient.avatarUrl}
                alt={patient.name}
                width={100}
                height={100}
                className="rounded-full"
              />
              <Tooltip content="Download Patient Report">
                <button
                  onClick={handleDownloadReport}
                  disabled={isDownloading}
                  className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {isDownloading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                </button>
              </Tooltip>
            </div>
            <h2 className="text-2xl font-bold line-clamp-2 w-full truncate">{patient.name}</h2>
            <p className="text-muted-foreground text-sm truncate w-full">{patient.email}</p>
            <button
              onClick={() => setIsQuestionnaireModalOpen(true)}
              className="mt-4 w-full px-4 py-2 border rounded-lg font-semibold hover:bg-accent transition-colors"
            >
              View Questionnaire
            </button>
          </div>

          {/* Divider */}
          <div className="border-l border-border mx-2 hidden md:block"></div>

          {/* Right Section: Patient Details Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 flex-1">
            <DetailItem label="Sex" value={patient.gender} />
            <DetailItem label="Age" value={patient.age} />
            <DetailItem label="Speech Score" value={patient.assessments.speech} />
            <DetailItem label="Cognitive Score" value={patient.assessments.cognitive} />
            <DetailItem label="Risk Score" value={patient.riskScore} />
            <DetailItem label="Risk Level" value={patient.riskLevel} />
            <DetailItem label="Smoker" value={patient.smoker} />
            <DetailItem label="Last Played" value={patient.lastPlayed} />
            <DetailItem label="Next Appointment" value={patient.nextAppointment} />
            <DetailItem label="Total Tests" value={patient.testHistory.length} />
          </div>
        </div>
      </motion.div>

      {/* Patient Game Scores */}
      <motion.div variants={itemVariants}>
        <h3 className="text-xl font-bold mb-4">Patient Game Scores (Latest Results)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ScoreCard
            title="Speech"
            score={latestScores.speech.score}
            maxScore={latestScores.speech.maxScore}
            status={speechStatus.status}
            statusColor={speechStatus.color}
          />
          <ScoreCard
            title="Cognitive"
            score={latestScores.cognitive.score}
            maxScore={latestScores.cognitive.maxScore}
            status={cognitiveStatus.status}
            statusColor={cognitiveStatus.color}
          />
          <ScoreCard
            title="Memory"
            score={latestScores.memory.score}
            maxScore={latestScores.memory.maxScore}
            status={memoryStatus.status}
            statusColor={memoryStatus.color}
          />
          <ScoreCard
            title="Avg"
            score={latestScores.avg.score}
            maxScore={latestScores.avg.maxScore}
            status={avgStatus.status}
            statusColor={avgStatus.color}
          />
        </div>
      </motion.div>

      {/* Clinical Assessment */}
      <motion.div variants={itemVariants}>
        <ClinicalAssessment patientId={patientId} />
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