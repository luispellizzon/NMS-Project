// src/app/patients/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import { mockPatients as initialMockPatients } from '@/lib/mock_data';
import { Patient, RiskLevel } from '@/types/patient';
import StatCard from '@/components/ui/patients/StatCard';
import PatientTable from '@/components/ui/patients/PatientTable';
import Pagination from '@/components/ui/common/Pagination';
import PatientDetailModal from '@/components/ui/patients/PatientDetailModal';
import Modal from '@/components/ui/common/Modal';
import { motion, Variants } from 'framer-motion';
import AddPatientModal from '@/components/ui/patients/AddPatientModal';

const ITEMS_PER_PAGE = 5;

// ... (filters and animation variants remain the same)
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
  const [allPatients, setAllPatients] = useState<Patient[]>(initialMockPatients);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | RiskLevel>('All');
  const [currentPage, setCurrentPage] = useState(1);

  // --- STATE FOR ACTIONS ---
  const [patientToView, setPatientToView] = useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // <-- State for the new modal

  // ... (riskCounts, filteredPatients, paginatedPatients memos remain the same)
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
  const handleGenerateReport = (patient: Patient) => {
    alert(`Generating report for ${patient.name}...`);
  };

  const handleContactPatient = (patient: Patient) => {
    alert(`Contacting ${patient.name}...`);
  };

  const handleConfirmDelete = () => {
    if (patientToDelete) {
      setAllPatients(prev => prev.filter(p => p.id !== patientToDelete.id));
      setPatientToDelete(null);
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
          {/* --- Update Add Patient Button --- */}
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors w-full sm:w-auto justify-center"
          >
            <Plus className="w-5 h-5" /> Add Patient
          </button>
        </motion.div>

        {/* Patient Table */}
        <motion.div variants={itemVariants}>
          <PatientTable 
            patients={paginatedPatients}
            onView={(patient) => setPatientToView(patient)}
            onReport={handleGenerateReport}
            onContact={handleContactPatient}
            onDelete={(patient) => setPatientToDelete(patient)}
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
      {/* --- Render the new AddPatientModal --- */}
      <AddPatientModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onPatientAdded={handlePatientAdded}
      />

      <PatientDetailModal
        isOpen={!!patientToView}
        onClose={() => setPatientToView(null)}
        patient={patientToView}
      />

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