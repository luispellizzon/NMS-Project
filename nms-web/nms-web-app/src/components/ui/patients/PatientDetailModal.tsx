// src/components/ui/patients/PatientDetailModal.tsx
import Modal from '@/components/ui/common/Modal';
import { Patient } from '@/types/patient';
import { User } from 'lucide-react'; // Using a generic icon

interface PatientDetailModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
}

// A new, cleaner row component for the updated design
const DetailRow = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex justify-between items-center py-3 border-b border-border last:border-b-0">
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="text-sm font-semibold text-foreground">{value}</p>
  </div>
);

export default function PatientDetailModal({ patient, isOpen, onClose }: PatientDetailModalProps) {
  if (!patient) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Patient Details">
      <div className="flex flex-col items-center text-center">
        {/* Centered Avatar and Name */}
        <div className="w-20 h-20 mb-4 bg-muted rounded-full flex items-center justify-center border-2 border-border">
          <User className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold text-foreground">{patient.name}</h3>
        <p className="text-sm text-muted-foreground mb-6">{patient.id}</p>

        {/* Details List */}
        <div className="w-full text-left">
          <DetailRow label="Age" value={`${patient.age} years`} />
          <DetailRow label="Gender" value={patient.gender} />
          <DetailRow label="Risk Score" value={`${patient.riskScore}/10 (${patient.riskLevel})`} />
          <DetailRow label="Trend" value={patient.trend} />
          <DetailRow label="Last Check" value={patient.lastCheck} />
          <DetailRow label="Next Appointment" value={patient.nextAppointment} />
        </div>
      </div>
    </Modal>
  );
}