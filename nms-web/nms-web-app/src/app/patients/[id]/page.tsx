// src/app/patients/[id]/page.tsx
'use client';

import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import Breadcrumbs from '@/components/ui/common/Breadcrumbs';
import ScoreCard from '@/components/ui/patients/ScoreCard';
import QuestionnaireModal from '@/components/ui/patients/QuestionnaireModal';
import { Download, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { getPatientById, getPatientRiskAssessment, getPatientGameScores, getPatientTestHistory } from '@/lib/firebase/firestore-service';
import { PatientProfile, TestHistoryItem } from '@/lib/mock_data';

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
          testHistory: testHistory.map((item: any) => ({
            id: item.id,
            date: item.date || '',
            test: item.test || '',
            timeTaken: item.timeTaken || '',
            score: item.score || '',
            totalPlays: item.totalPlays || 0,
          })) as TestHistoryItem[],
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
          <p className="text-sm text-muted-foreground">Total Games {patient.testHistory.length}</p>
        </div>
        <div className="bg-card rounded-lg border shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50">
              <tr>
                {['Date', 'Test', 'Time Taken', 'Score', 'Total Plays', 'Download'].map(h => (
                  <th key={h} className="p-4 font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {patient.testHistory.map(item => (
                <motion.tr 
                  key={item.id} 
                  className="border-b last:border-b-0"
                  whileHover={{ backgroundColor: 'var(--color-accent)' }}
                >
                  <td className="p-4">{item.date}</td>
                  <td className="p-4 font-medium text-foreground">{item.test}</td>
                  <td className="p-4">{item.timeTaken}</td>
                  <td className="p-4">{item.score}</td>
                  <td className="p-4">{item.totalPlays}</td>
                  <td className="p-4">
                    <button className="p-2 hover:bg-accent rounded-md text-muted-foreground">
                      <Download className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
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