// src/app/patients/page.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, UserPlus, Loader2, Trash2 } from 'lucide-react';
import { Patient, RiskLevel } from '@/types/patient';
import StatCard from '@/components/ui/patients/StatCard';
import PatientTable from '@/components/ui/patients/PatientTable';
import Pagination from '@/components/ui/common/Pagination';
import PatientDetailModal from '@/components/ui/patients/PatientDetailModal';
import Modal from '@/components/ui/common/Modal';
import { motion, Variants } from 'framer-motion';
import AddPatientModal from '@/components/ui/patients/AddPatientModal';
import AssignPatientModal from '@/components/ui/patients/AssignPatientModal';
import EditPatientModal from '@/components/ui/patients/EditPatientModal';
import { useAuth } from '@/contexts/AuthContext';
import { getDoctorProfile, getDoctorPatients, removePatientFromDoctor, getPatientRiskAssessment, getPatientById, getPatientGameScores, getPatientTestHistory } from '@/lib/firebase/firestore-service';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { pdf } from '@react-pdf/renderer';
import { PatientReportPDF } from '@/components/ui/patients/PatientReportPDF';
import { PatientProfile } from '@/types/patient';

const ITEMS_PER_PAGE = 5;

const filters: { label: string; value: 'All' | RiskLevel }[] = [
    { label: 'All', value: 'All' },
    { label: 'High Risk', value: 'High' },
    { label: 'Moderate', value: 'Moderate' },
    { label: 'Low', value: 'Low' },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};


export default function PatientsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | RiskLevel>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [doctorId, setDoctorId] = useState<string>('');
  const [assignedPatientIds, setAssignedPatientIds] = useState<string[]>([]); // State for assigned IDs
  console.log("All Patients: ", allPatients)
  // --- STATE FOR ACTIONS ---
  const [patientToView, setPatientToView] = useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Check authentication and load data
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/signin');
      } else {
        loadDoctorPatients();
      }
    }
  }, [user, authLoading, router]);

  const loadDoctorPatients = async () => {
    if (!user) return;

    setDataLoading(true);
    setError('');

    try {
      // Fetch doctor profile
      const doctorProfile = await getDoctorProfile(user.uid);

      if (!doctorProfile) {
        setError('Doctor profile not found. Please complete your signup.');
        setDataLoading(false);
        return;
      }

      setDoctorId(doctorProfile.id);

      // Fetch doctor's patients
      const patientIds = await getDoctorPatients(user.uid);
      setAssignedPatientIds(patientIds); // Store the assigned patient IDs

      // Fetch patient details from users collection and risk assessments
      const patientDetails: Patient[] = [];
      for (const patientId of patientIds) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('__name__', '==', patientId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const patientData = querySnapshot.docs[0].data();

          // Fetch risk assessment data for this patient (for age, gender from questionnaire)
          const riskAssessment = await getPatientRiskAssessment(patientId);

          // Calculate risk score from MMSE score (0-30 scale)
          // Convert to 0-10 scale: lower MMSE = higher risk
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

          // Calculate cognitive and speech scores from MMSE components (approximation)
          // Since you don't have separate scores, use MMSE as basis (0-30 -> 0-5 scale)
          const cognitiveScore = mmseScore > 0 ? Math.round((mmseScore / 30) * 5 * 10) / 10 : 0;
          const speechScore = cognitiveScore; // Same approximation for now

          patientDetails.push({
            id: patientId,
            name: patientData.fullName || 'Unknown',
            // Age and gender come from risk assessment questionnaire
            age: riskAssessment?.age || 0,
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
          });
        }
      }

      setAllPatients(patientDetails);
    } catch (err) {
      console.error('Error loading doctor data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setDataLoading(false);
    }
  };
  const riskCounts = useMemo(() => {
    return allPatients.reduce(
      (acc, patient) => {
        acc[patient.riskLevel]++;
        return acc;
      },
      { High: 0, Moderate: 0, Low: 0 }
    );
  }, [allPatients]);
  
  const filteredPatients = useMemo(() => {
    return allPatients.filter((patient) => {
        if (activeFilter !== 'All' && patient.riskLevel !== activeFilter) return false;
        if (searchTerm && !(patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || patient.id.toLowerCase().includes(searchTerm.toLowerCase()))) return false;
        return true;
      });
  }, [searchTerm, activeFilter, allPatients]);

  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);

  const paginatedPatients = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPatients.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPatients, currentPage]);

  // --- ACTION HANDLERS ---
  const handleGenerateReport = async (patient: Patient) => {
    try {
      // Fetch complete patient data
      const patientData = await getPatientById(patient.id);
      if (!patientData) {
        alert('Patient data not found');
        return;
      }

      // Fetch risk assessment data
      const riskAssessment = await getPatientRiskAssessment(patient.id);

      // Fetch game scores
      const gameScores = await getPatientGameScores(patient.id);

      // Fetch test history
      const testHistory = await getPatientTestHistory(patient.id);

      // Create complete patient profile
      const patientProfile: PatientProfile = {
        id: patient.id,
        name: patient.name,
        email: patientData.email,
        age: patient.age,
        gender: patient.gender,
        avatarUrl: patient.avatarUrl,
        riskScore: patient.riskScore,
        riskLevel: patient.riskLevel,
        trend: patient.trend,
        assessments: patient.assessments,
        lastCheck: patient.lastCheck,
        nextAppointment: patient.nextAppointment,
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

      // Generate PDF
      const doc = <PatientReportPDF patient={patientProfile} questionnaireData={riskAssessment} />;
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
    }
  };

  const handleContactPatient = (patient: Patient) => {
    alert(`Contacting ${patient.name}...`);
  };

  const handleConfirmDelete = async () => {
    if (patientToDelete && doctorId) {
      try {
        await removePatientFromDoctor(doctorId, patientToDelete.id);
        setAllPatients(prev => prev.filter(p => p.id !== patientToDelete.id));
        setPatientToDelete(null);
      } catch (err) {
        console.error('Error removing patient:', err);
        alert('Failed to remove patient. Please try again.');
      }
    }
  };

  const handleFilterChange = (filter: 'All' | RiskLevel) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  }

  // --- Handler to update UI after adding a patient ---
  const handlePatientAdded = (newPatient: Patient) => {
    setAllPatients(prev => [newPatient, ...prev]);
  };

  // --- Handler for patient assignment ---
  const handlePatientAssigned = (newlyAssignedPatientId: string) => {
    // Optimistically update the list of assigned IDs to instantly disable the button in the modal
    setAssignedPatientIds(prevIds => [...prevIds, newlyAssignedPatientId]);
    // Reload all patient data to get the full new patient object and refresh the main table
    loadDoctorPatients();
  };

  // --- Handler for patient edit ---
  const handlePatientUpdated = (updatedPatient: Patient) => {
    setAllPatients(prev =>
      prev.map(p => p.id === updatedPatient.id ? updatedPatient : p)
    );
    setPatientToEdit(null);
  };

  // Loading state
  if (authLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your patients...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div 
        className="w-full space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold text-foreground">Patients Dashboard</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage your patients' dementia risk assessments</p>
        </motion.div>

        {/* Stat Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Patients" value={allPatients.length} />
          <StatCard title="High Risk" value={riskCounts.High} />
          <StatCard title="Moderate Risk" value={riskCounts.Moderate} />
          <StatCard title="Low Risk" value={riskCounts.Low} />
        </motion.div>

        {/* Filter and Actions Bar */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search patient by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-card focus:ring-2 focus:ring-primary"
            />
          </div>
          {/* Filter Buttons */}
          <div className="flex items-center gap-2">
            {filters.map((filter) => (
              <button key={filter.value} onClick={() => handleFilterChange(filter.value)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${ activeFilter === filter.value ? 'bg-primary text-primary-foreground' : 'bg-card border hover:bg-accent' }`}>
                {filter.label}
              </button>
            ))}
          </div>
          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground border rounded-lg font-semibold hover:bg-secondary/90 transition-colors flex-1 sm:flex-none justify-center"
            >
              <UserPlus className="w-5 h-5" /> Assign Patient
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex-1 sm:flex-none justify-center"
            >
              <Plus className="w-5 h-5" /> Add Patient
            </button>
          </div>
        </motion.div>

        {/* Patient Table */}
        <motion.div variants={itemVariants}>
          <PatientTable
            patients={paginatedPatients}
            onView={(patient) => setPatientToView(patient)}
            onReport={handleGenerateReport}
            onContact={handleContactPatient}
            onDelete={(patient) => setPatientToDelete(patient)}
            onEdit={(patient) => setPatientToEdit(patient)}
          />
        </motion.div>

        {/* Pagination */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {paginatedPatients.length} of {filteredPatients.length} patients
          </p>
          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          )}
        </motion.div>
      </motion.div>

      {/* --- MODALS --- */}
      <AddPatientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onPatientAdded={handlePatientAdded}
      />

      {/* Pass the assignedPatientIds to the modal */}
      <AssignPatientModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        doctorId={doctorId}
        assignedPatientIds={assignedPatientIds} 
        onPatientAssigned={handlePatientAssigned}
      />

      <PatientDetailModal
        isOpen={!!patientToView}
        onClose={() => setPatientToView(null)}
        patient={patientToView}
      />

      {patientToEdit && (
        <EditPatientModal
          isOpen={!!patientToEdit}
          onClose={() => setPatientToEdit(null)}
          patient={patientToEdit}
          onPatientUpdated={handlePatientUpdated}
        />
      )}

      <Modal
        isOpen={!!patientToDelete}
        onClose={() => setPatientToDelete(null)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete the record for <span className="font-semibold">{patientToDelete?.name}</span>? This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setPatientToDelete(null)} className="px-4 py-2 border rounded-md font-medium hover:bg-accent">
              Cancel
            </button>
            <button onClick={handleConfirmDelete} className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md font-semibold hover:bg-destructive/90">
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}