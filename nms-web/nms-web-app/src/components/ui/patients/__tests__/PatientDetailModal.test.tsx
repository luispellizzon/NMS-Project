// src/components/ui/patients/PatientDetailModal.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PatientDetailModal from '../PatientDetailModal';
import type { Patient } from '@/types/patient';

describe('PatientDetailModal', () => {
  const mockPatient: Patient = {
    id: 'P001',
    name: 'John Doe',
    age: 65,
    gender: 'Male',
    avatarUrl: '/images/Avatar.jpg',
    riskScore: 7.5,
    riskLevel: 'High',
    trend: 'Down',
    assessments: { cognitive: 2, speech: 1 },
    lastCheck: '2025-09-28',
    nextAppointment: '2025-11-15',
  };

  const mockOnClose = vi.fn();

  it('renders modal when isOpen is true and patient is provided', () => {
    render(
      <PatientDetailModal
        patient={mockPatient}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Patient Details')).toBeInTheDocument();
  });

  it('does not render modal when isOpen is false', () => {
    render(
      <PatientDetailModal
        patient={mockPatient}
        isOpen={false}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText('Patient Details')).not.toBeInTheDocument();
  });

  it('does not render modal when patient is null', () => {
    render(
      <PatientDetailModal
        patient={null}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText('Patient Details')).not.toBeInTheDocument();
  });

  it('displays patient name and ID', () => {
    render(
      <PatientDetailModal
        patient={mockPatient}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('P001')).toBeInTheDocument();
  });

  it('displays patient age', () => {
    render(
      <PatientDetailModal
        patient={mockPatient}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('65 years')).toBeInTheDocument();
  });

  it('displays patient gender', () => {
    render(
      <PatientDetailModal
        patient={mockPatient}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Gender')).toBeInTheDocument();
    expect(screen.getByText('Male')).toBeInTheDocument();
  });

  it('displays risk score and level', () => {
    render(
      <PatientDetailModal
        patient={mockPatient}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Risk Score')).toBeInTheDocument();
    expect(screen.getByText('7.5/10 (High)')).toBeInTheDocument();
  });

  it('displays patient trend', () => {
    render(
      <PatientDetailModal
        patient={mockPatient}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Trend')).toBeInTheDocument();
    expect(screen.getByText('Down')).toBeInTheDocument();
  });

  it('displays last check date', () => {
    render(
      <PatientDetailModal
        patient={mockPatient}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Last Check')).toBeInTheDocument();
    expect(screen.getByText('2025-09-28')).toBeInTheDocument();
  });

  it('displays next appointment date', () => {
    render(
      <PatientDetailModal
        patient={mockPatient}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Next Appointment')).toBeInTheDocument();
    expect(screen.getByText('2025-11-15')).toBeInTheDocument();
  });

  it('renders user icon', () => {
    const { container } = render(
      <PatientDetailModal
        patient={mockPatient}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const userIcon = container.querySelector('.lucide-user');
    expect(userIcon).toBeInTheDocument();
  });

  it('displays all detail rows with correct labels', () => {
    render(
      <PatientDetailModal
        patient={mockPatient}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('Gender')).toBeInTheDocument();
    expect(screen.getByText('Risk Score')).toBeInTheDocument();
    expect(screen.getByText('Trend')).toBeInTheDocument();
    expect(screen.getByText('Last Check')).toBeInTheDocument();
    expect(screen.getByText('Next Appointment')).toBeInTheDocument();
  });

  it('handles female patient correctly', () => {
    const femalePatient: Patient = {
      ...mockPatient,
      gender: 'Female',
      name: 'Jane Smith',
    };

    render(
      <PatientDetailModal
        patient={femalePatient}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Female')).toBeInTheDocument();
  });

  it('handles different risk levels correctly', () => {
    const lowRiskPatient: Patient = {
      ...mockPatient,
      riskScore: 2.5,
      riskLevel: 'Low',
    };

    render(
      <PatientDetailModal
        patient={lowRiskPatient}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('2.5/10 (Low)')).toBeInTheDocument();
  });
});