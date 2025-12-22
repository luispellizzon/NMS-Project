// src/components/ui/patients/AssignPatientModal.tsx
'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/common/Modal';
import { getAllPatients, assignPatientToDoctor } from '@/lib/firebase/firestore-service';
import { Search, UserPlus, CheckCircle2 } from 'lucide-react';

interface PatientListItem {
  id: string;
  fullName: string;
  email: string;
}

interface AssignPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: string;
  assignedPatientIds: string[]; // New prop for existing patient IDs
  onPatientAssigned: (patientId: string) => void;
}

export default function AssignPatientModal({
  isOpen,
  onClose,
  doctorId,
  assignedPatientIds, // Destructure the new prop
  onPatientAssigned,
}: AssignPatientModalProps) {
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<PatientListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch all patients when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPatients();
    }
  }, [isOpen]);

  // Filter patients based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(
        (p) =>
          p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  const fetchPatients = async () => {
    setLoading(true);
    setError('');
    try {
      const allPatients = await getAllPatients();
      setPatients(allPatients);
      setFilteredPatients(allPatients);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPatient = async (patientId: string, patientName: string) => {
    setError('');
    setSuccess(null);
    try {
      await assignPatientToDoctor(doctorId, patientId);
      setSuccess(`${patientName} has been assigned successfully!`);
      onPatientAssigned(patientId); // This callback updates the parent component

      // Clear success message after 2 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 2000);
    } catch (err: any) {
      console.error('Error assigning patient:', err);
      setError(err.message || 'Failed to assign patient. Please try again.');
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setError('');
    setSuccess(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Assign Patients">
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-900/20 border border-green-500 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-green-800 dark:text-green-200 text-sm">{success}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-500 rounded-lg">
            <span className="text-red-800 dark:text-red-200 text-sm">{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Patient List */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredPatients.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {searchTerm ? 'No patients found matching your search.' : 'No patients available to assign.'}
                </p>
              ) : (
                filteredPatients.map((patient) => {
                  // Check if the current patient is already assigned
                  const isAssigned = assignedPatientIds.includes(patient.id);

                  return (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div>
                        <h3 className="font-semibold text-foreground">{patient.fullName}</h3>
                        <p className="text-sm text-muted-foreground">{patient.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">ID: {patient.id}</p>
                      </div>
                      <button
                        onClick={() => handleAssignPatient(patient.id, patient.fullName)}
                        disabled={isAssigned} // Disable button if assigned
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          isAssigned
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            : 'bg-primary text-primary-foreground hover:bg-primary/90'
                        }`}
                      >
                        {isAssigned ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Assigned
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            Assign
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={handleClose}
            className="px-4 py-2 border rounded-lg font-medium hover:bg-accent transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}