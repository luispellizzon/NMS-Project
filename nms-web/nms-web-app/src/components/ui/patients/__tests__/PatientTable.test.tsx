// src/components/ui/patients/PatientTable.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PatientTable from '../PatientTable';
import type { Patient } from '@/types/patient';

describe('PatientTable', () => {
  const mockPatients: Patient[] = [
    {
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
    },
    {
      id: 'P002',
      name: 'Jane Smith',
      age: 70,
      gender: 'Female',
      avatarUrl: '/images/Avatar.jpg',
      riskScore: 5.2,
      riskLevel: 'Moderate',
      trend: 'Stable',
      assessments: { cognitive: 4, speech: 3 },
      lastCheck: '2025-10-01',
      nextAppointment: '2025-11-20',
    },
  ];

  const mockCallbacks = {
    onView: vi.fn(),
    onReport: vi.fn(),
    onContact: vi.fn(),
    onDelete: vi.fn(),
  };

  it('renders table headers', () => {
    render(<PatientTable patients={mockPatients} {...mockCallbacks} />);

    expect(screen.getByText('Patient')).toBeInTheDocument();
    expect(screen.getByText('Risk Score')).toBeInTheDocument();
    expect(screen.getByText('Trend')).toBeInTheDocument();
  });

  it('renders patient data', () => {
    render(<PatientTable patients={mockPatients} {...mockCallbacks} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('renders patient IDs, ages, and genders', () => {
    render(<PatientTable patients={mockPatients} {...mockCallbacks} />);

    expect(screen.getByText(/P001.*65Y.*Male/)).toBeInTheDocument();
    expect(screen.getByText(/P002.*70Y.*Female/)).toBeInTheDocument();
  });

  it('renders risk score badges', () => {
    render(<PatientTable patients={mockPatients} {...mockCallbacks} />);

    expect(screen.getByText('7.5 / 10')).toBeInTheDocument();
    expect(screen.getByText('5.2 / 10')).toBeInTheDocument();
  });

  it('renders trend information', () => {
    render(<PatientTable patients={mockPatients} {...mockCallbacks} />);

    expect(screen.getByText('Down')).toBeInTheDocument();
    expect(screen.getByText('Stable')).toBeInTheDocument();
  });

  it('renders assessment information', () => {
    render(<PatientTable patients={mockPatients} {...mockCallbacks} />);

    // Check that assessment info is displayed (Cognitive and Speech labels)
    const cognitiveLabels = screen.getAllByText(/Cognitive:/);
    const speechLabels = screen.getAllByText(/Speech:/);

    expect(cognitiveLabels.length).toBe(mockPatients.length);
    expect(speechLabels.length).toBe(mockPatients.length);
  });

  it('renders last check dates', () => {
    render(<PatientTable patients={mockPatients} {...mockCallbacks} />);

    expect(screen.getByText('2025-09-28')).toBeInTheDocument();
    expect(screen.getByText('2025-10-01')).toBeInTheDocument();
  });

  it('renders next appointment dates', () => {
    render(<PatientTable patients={mockPatients} {...mockCallbacks} />);

    expect(screen.getByText('2025-11-15')).toBeInTheDocument();
    expect(screen.getByText('2025-11-20')).toBeInTheDocument();
  });

  it('renders patient avatars', () => {
    const { container } = render(<PatientTable patients={mockPatients} {...mockCallbacks} />);

    const images = container.querySelectorAll('img');
    expect(images.length).toBeGreaterThanOrEqual(mockPatients.length);
  });

  it('renders links to patient detail pages', () => {
    render(<PatientTable patients={mockPatients} {...mockCallbacks} />);

    const links = screen.getAllByRole('link');
    const patientLinks = links.filter(link => link.getAttribute('href')?.startsWith('/patients/'));

    // There will be multiple links per patient (name link + action links)
    expect(patientLinks.length).toBeGreaterThanOrEqual(mockPatients.length);

    // Check that the main patient links exist
    expect(patientLinks[0]).toHaveAttribute('href', '/patients/P001');
  });

  it('renders action buttons for each patient', () => {
    const { container } = render(<PatientTable patients={mockPatients} {...mockCallbacks} />);

    // Each row should have action buttons (menu)
    const moreButtons = container.querySelectorAll('button');
    expect(moreButtons.length).toBeGreaterThan(0);
  });
});