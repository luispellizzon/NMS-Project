// src/components/ui/patients/AddPatientModal.tsx
'use client';

import { useState, FormEvent } from 'react';
import Modal from '@/components/ui/common/Modal';
import { addPatient } from '@/lib/firebase/firestore-service';
import { Patient } from '@/types/patient';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientAdded: (newPatient: Patient) => void;
}

const InputField = ({ id, label, type, value, onChange, required = true }: any) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-foreground mb-1.5">
      {label}
    </label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      required={required}
    />
  </div>
);

export default function AddPatientModal({ isOpen, onClose, onPatientAdded }: AddPatientModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    dateOfBirth: '',
    gender: 'Female' as 'Male' | 'Female',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const newPatientData = { ...formData, role: 'patient' as const };
      const newPatientId = await addPatient(newPatientData);

      // Create a complete Patient object to update the local UI state
      const newPatientForUI: Patient = {
        id: newPatientId,
        name: formData.fullName,
        age: new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear(),
        gender: formData.gender,
        avatarUrl: '/images/Avatar.jpg', // Default avatar
        riskScore: 0,
        riskLevel: 'Low',
        trend: 'Stable',
        assessments: { cognitive: 0, speech: 0 },
        lastCheck: new Date().toISOString().split('T')[0],
        nextAppointment: 'Not set',
      };
      
      onPatientAdded(newPatientForUI);
      onClose(); // Close the modal on success
      
    } catch (err) {
      setError('Failed to add patient. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Patient">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-500 bg-red-500/10 p-3 rounded-md">{error}</p>}
        
        <InputField id="fullName" label="Full Name" type="text" value={formData.fullName} onChange={handleChange} />
        <InputField id="email" label="Email Address" type="email" value={formData.email} onChange={handleChange} />
        <InputField id="dateOfBirth" label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={handleChange} />
        
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-foreground mb-1.5">Gender</label>
          <select
            id="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="Female">Female</option>
            <option value="Male">Male</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md font-medium hover:bg-accent">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 disabled:opacity-50">
            {loading ? 'Adding...' : 'Add Patient'}
          </button>
        </div>
      </form>
    </Modal>
  );
}