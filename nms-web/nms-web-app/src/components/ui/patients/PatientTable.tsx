// src/components/ui/patients/PatientTable.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Eye, FileText, Phone, MoreVertical, ArrowUp, ArrowDown, Trash2, Edit } from 'lucide-react';
import { Patient, Trend } from '@/types/patient';
import RiskScoreBadge from './RiskScoreBadge';
import Tooltip from '@/components/ui/common/Tooltip';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TrendIcon = ({ trend }: { trend: Trend }) => {
  if (trend === 'Up') return <ArrowUp className="w-4 h-4 text-green-500" />;
  if (trend === 'Down') return <ArrowDown className="w-4 h-4 text-red-500" />;
  return <div className="w-4 h-4 flex items-center justify-center">-</div>;
};

interface PatientTableRowProps {
  patient: Patient;
  onView: (patient: Patient) => void;
  onReport: (patient: Patient) => void;
  onContact: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
}

const PatientTableRow = ({ patient, onView, onReport, onContact, onDelete, onEdit }: PatientTableRowProps) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  return (
    <motion.tr
      className="border-b border-border hover:bg-accent/30 transition-colors duration-150"
    >
      {/* Patient Info */}
      <td className="p-4 align-middle">
        {/* --- WRAP PATIENT INFO IN A LINK --- */}
        <Link href={`/patients/${patient.id}`} className="flex items-center gap-3 group">
          <Image src={patient.avatarUrl} alt={patient.name} width={40} height={40} className="rounded-full" />
          <div>
            <p className="font-medium text-foreground group-hover:text-primary transition-colors">{patient.name}</p>
            <p className="text-sm text-muted-foreground">{`${patient.age}Y • ${patient.gender}`}</p>
          </div>
        </Link>
      </td>
      
      {/* Other cells */}
      <td className="p-4 align-middle"><RiskScoreBadge score={patient.riskScore} level={patient.riskLevel} /></td>
      <td className="p-4 align-middle"><div className="flex items-center gap-1 text-muted-foreground"><TrendIcon trend={patient.trend} /><span>{patient.trend}</span></div></td>
      <td className="p-4 align-middle text-sm text-muted-foreground"><p>Cognitive: {patient.assessments.cognitive}/5</p><p>Speech: {patient.assessments.speech}/5</p></td>
      <td className="p-4 align-middle text-muted-foreground">{patient.lastCheck}</td>
      <td className="p-4 align-middle text-muted-foreground">{patient.nextAppointment}</td>
      
      {/* Actions Cell */}
      <td className="p-4 align-middle">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Tooltip content="View Details">
            <Link href={`/patients/${patient.id}`} className="p-2 hover:bg-accent rounded-md"><Eye className="w-5 h-5" /></Link>
          </Tooltip>
          <Tooltip content="Generate Report"><button onClick={() => onReport(patient)} className="p-2 hover:bg-accent rounded-md"><FileText className="w-5 h-5" /></button></Tooltip>
          <Tooltip content="Contact Patient"><button onClick={() => onContact(patient)} className="p-2 hover:bg-accent rounded-md"><Phone className="w-5 h-5" /></button></Tooltip>
          
          <div className="relative" ref={menuRef}> 
            <Tooltip content="More Actions">
              <button onClick={() => setMenuOpen(!isMenuOpen)} className="p-2 hover:bg-accent rounded-md" data-testid={`more-actions-${patient.id}`}><MoreVertical className="w-5 h-5" /></button>
            </Tooltip>
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-1 w-40 bg-card border border-border rounded-md shadow-lg z-10"
                >
                  <button onClick={() => { onEdit(patient); setMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent">
                    <Edit className="w-4 h-4" /> Edit Patient
                  </button>
                  <button onClick={() => { onDelete(patient); setMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-accent">
                    <Trash2 className="w-4 h-4" /> Delete Patient
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </td>
    </motion.tr>
  );
};

interface PatientTableProps {
    patients: Patient[];
    onView: (patient: Patient) => void;
    onReport: (patient: Patient) => void;
    onContact: (patient: Patient) => void;
    onDelete: (patient: Patient) => void;
    onEdit: (patient: Patient) => void;
  }

  export default function PatientTable({ patients, onView, onReport, onContact, onDelete, onEdit }: PatientTableProps) {
    const headers = ['Patient', 'Risk Score', 'Trend', 'Assessments', 'Last Check', 'Next Appointment', 'Actions'];
    return (
      <div className="bg-card rounded-lg border shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50">
            <tr>
              {headers.map((header) => (<th key={header} className="p-4 font-semibold text-muted-foreground tracking-wider uppercase">{header}</th>))}
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <PatientTableRow key={patient.id} patient={patient} onView={onView} onReport={onReport} onContact={onContact} onDelete={onDelete} onEdit={onEdit} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }