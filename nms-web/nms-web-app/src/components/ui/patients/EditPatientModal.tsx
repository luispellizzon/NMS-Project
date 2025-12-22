// src/components/ui/patients/EditPatientModal.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import Modal from '@/components/ui/common/Modal';
import { updatePatient } from '@/lib/firebase/services';
import { Patient } from '@/types/patient';

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onPatientUpdated: (updatedPatient: Patient) => void;
}

const InputField = ({ id, label, type, value, onChange, required = true }: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) => (
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

export default function EditPatientModal({ isOpen, onClose, patient, onPatientUpdated }: EditPatientModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    dateOfBirth: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pre-populate form when patient changes or modal opens
  useEffect(() => {
    if (patient && isOpen) {
      setFormData({
        fullName: patient.name || '',
        email: (patient as any).email || '',
        dateOfBirth: (patient as any).dateOfBirth || '',
        location: (patient as any).location || '',
      });
      setError('');
      setSuccess('');
    }
  }, [patient, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Only send fields that have values
      const updates: Record<string, string> = {};
      if (formData.fullName) updates.fullName = formData.fullName;
      if (formData.email) updates.email = formData.email;
      if (formData.dateOfBirth) updates.dateOfBirth = formData.dateOfBirth;
      if (formData.location) updates.location = formData.location;

      await updatePatient(patient.id, updates);

      // Create updated patient object for UI
      const updatedPatient: Patient = {
        ...patient,
        name: formData.fullName || patient.name,
      };

      setSuccess('Patient updated successfully!');

      // Wait briefly to show success message, then close
      setTimeout(() => {
        onPatientUpdated(updatedPatient);
        onClose();
      }, 1000);

    } catch (err) {
      setError('Failed to update patient. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Patient">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-500 bg-red-500/10 p-3 rounded-md">{error}</p>}
        {success && <p className="text-sm text-green-500 bg-green-500/10 p-3 rounded-md">{success}</p>}

        <InputField
          id="fullName"
          label="Full Name"
          type="text"
          value={formData.fullName}
          onChange={handleChange}
        />
        <InputField
          id="email"
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={handleChange}
        />
        <InputField
          id="dateOfBirth"
          label="Date of Birth"
          type="date"
          value={formData.dateOfBirth}
          onChange={handleChange}
        />
        <InputField
          id="location"
          label="Location"
          type="text"
          value={formData.location}
          onChange={handleChange}
          required={false}
        />

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-md font-medium hover:bg-accent"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
