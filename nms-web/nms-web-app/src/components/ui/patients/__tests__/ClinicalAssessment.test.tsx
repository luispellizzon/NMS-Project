// src/components/ui/patients/__tests__/ClinicalAssessment.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClinicalAssessment from '../ClinicalAssessment';
import * as firestoreService from '@/lib/firebase/firestore-service';
import * as authContext from '@/contexts/AuthContext';

// Mock Firestore service
vi.mock('@/lib/firebase/firestore-service', () => ({
  getClinicalAssessment: vi.fn(),
  saveClinicalAssessment: vi.fn(),
}));

// Mock Auth context
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('ClinicalAssessment', () => {
  const mockUser = {
    uid: 'doctor-123',
    email: 'doctor@example.com',
    emailVerified: true,
    displayName: 'Dr. Smith',
    photoURL: null,
    phoneNumber: null,
    isAnonymous: false,
    metadata: {} as any,
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: vi.fn(),
    getIdToken: vi.fn(),
    getIdTokenResult: vi.fn(),
    reload: vi.fn(),
    toJSON: vi.fn(),
    providerId: 'firebase',
  };

  const mockAssessment = {
    id: 'patient-123',
    patientId: 'patient-123',
    doctorId: 'doctor-123',
    riskLevel: 'Moderate' as const,
    notes: 'Patient shows signs of mild cognitive decline',
    timestamp: new Date('2024-01-15T10:00:00Z'),
    lastUpdated: new Date('2024-01-20T14:30:00Z'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authContext.useAuth).mockReturnValue({
      user: mockUser as any,
      loading: false,
    });
  });

  it('renders loading state initially', () => {
    vi.mocked(firestoreService.getClinicalAssessment).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { container } = render(<ClinicalAssessment patientId="patient-123" />);

    // Check for the card container and loading state
    expect(container.querySelector('.bg-card')).toBeInTheDocument();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders edit mode when no assessment exists', async () => {
    vi.mocked(firestoreService.getClinicalAssessment).mockResolvedValue(null);

    render(<ClinicalAssessment patientId="patient-123" />);

    await waitFor(() => {
      expect(screen.getByText('Clinical Assessment')).toBeInTheDocument();
      expect(screen.getByLabelText(/Risk Level/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Notes/i)).toBeInTheDocument();
    });
  });

  it('renders existing assessment in display mode', async () => {
    vi.mocked(firestoreService.getClinicalAssessment).mockResolvedValue(mockAssessment);

    render(<ClinicalAssessment patientId="patient-123" />);

    await waitFor(() => {
      expect(screen.getByText('Clinical Assessment')).toBeInTheDocument();
      expect(screen.getByText('Moderate Risk')).toBeInTheDocument();
      expect(screen.getByText('Patient shows signs of mild cognitive decline')).toBeInTheDocument();
      expect(screen.getByText(/Last updated:/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
    });
  });

  it('switches to edit mode when Edit button is clicked', async () => {
    vi.mocked(firestoreService.getClinicalAssessment).mockResolvedValue(mockAssessment);

    render(<ClinicalAssessment patientId="patient-123" />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /Edit/i });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/Risk Level/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Notes/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Save Assessment/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    // Check that form is pre-filled
    const selectElement = screen.getByLabelText(/Risk Level/i) as HTMLSelectElement;
    expect(selectElement.value).toBe('Moderate');

    const notesElement = screen.getByLabelText(/Notes/i) as HTMLTextAreaElement;
    expect(notesElement.value).toBe('Patient shows signs of mild cognitive decline');
  });

  it('disables Save button when no risk level is selected', async () => {
    vi.mocked(firestoreService.getClinicalAssessment).mockResolvedValue(null);

    render(<ClinicalAssessment patientId="patient-123" />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Assessment/i })).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /Save Assessment/i });
    expect(saveButton).toBeDisabled();
  });

  it('enables Save button when risk level is selected', async () => {
    vi.mocked(firestoreService.getClinicalAssessment).mockResolvedValue(null);

    const user = userEvent.setup();
    render(<ClinicalAssessment patientId="patient-123" />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Risk Level/i)).toBeInTheDocument();
    });

    const selectElement = screen.getByLabelText(/Risk Level/i);
    await user.selectOptions(selectElement, 'High');

    const saveButton = screen.getByRole('button', { name: /Save Assessment/i });
    expect(saveButton).not.toBeDisabled();
  });

  it('saves assessment successfully', async () => {
    vi.mocked(firestoreService.getClinicalAssessment)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        ...mockAssessment,
        riskLevel: 'High',
        notes: 'New assessment notes',
      });

    vi.mocked(firestoreService.saveClinicalAssessment).mockResolvedValue('patient-123');

    const user = userEvent.setup();
    render(<ClinicalAssessment patientId="patient-123" />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Risk Level/i)).toBeInTheDocument();
    });

    const selectElement = screen.getByLabelText(/Risk Level/i);
    await user.selectOptions(selectElement, 'High');

    const notesElement = screen.getByLabelText(/Notes/i);
    await user.clear(notesElement);
    await user.type(notesElement, 'New assessment notes');

    const saveButton = screen.getByRole('button', { name: /Save Assessment/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(firestoreService.saveClinicalAssessment).toHaveBeenCalledWith({
        patientId: 'patient-123',
        doctorId: 'doctor-123',
        riskLevel: 'High',
        notes: 'New assessment notes',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Assessment saved successfully')).toBeInTheDocument();
    });
  });

  it('shows error when saving without risk level', async () => {
    vi.mocked(firestoreService.getClinicalAssessment).mockResolvedValue(null);

    render(<ClinicalAssessment patientId="patient-123" />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Risk Level/i)).toBeInTheDocument();
    });

    // Try to save without selecting risk level
    const saveButton = screen.getByRole('button', { name: /Save Assessment/i });

    // Button should be disabled, so we can't actually click it
    expect(saveButton).toBeDisabled();
  });

  it('handles save error gracefully', async () => {
    vi.mocked(firestoreService.getClinicalAssessment).mockResolvedValue(null);
    vi.mocked(firestoreService.saveClinicalAssessment).mockRejectedValue(
      new Error('Failed to save')
    );

    const user = userEvent.setup();
    render(<ClinicalAssessment patientId="patient-123" />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Risk Level/i)).toBeInTheDocument();
    });

    const selectElement = screen.getByLabelText(/Risk Level/i);
    await user.selectOptions(selectElement, 'Low');

    const saveButton = screen.getByRole('button', { name: /Save Assessment/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to save assessment. Please try again.')).toBeInTheDocument();
    });
  });

  it('cancels editing and reverts to display mode', async () => {
    vi.mocked(firestoreService.getClinicalAssessment).mockResolvedValue(mockAssessment);

    render(<ClinicalAssessment patientId="patient-123" />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /Edit/i });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByText('Moderate Risk')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
    });
  });

  it('displays correct risk level colors', async () => {
    const highRiskAssessment = { ...mockAssessment, riskLevel: 'High' as const };
    vi.mocked(firestoreService.getClinicalAssessment).mockResolvedValue(highRiskAssessment);

    render(<ClinicalAssessment patientId="patient-123" />);

    await waitFor(() => {
      const riskBadge = screen.getByText('High Risk');
      expect(riskBadge).toHaveClass('bg-red-100', 'text-red-800');
    });
  });

  it('shows error when user is not logged in', async () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      user: null,
      loading: false,
    });

    vi.mocked(firestoreService.getClinicalAssessment).mockResolvedValue(null);

    const user = userEvent.setup();
    render(<ClinicalAssessment patientId="patient-123" />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Risk Level/i)).toBeInTheDocument();
    });

    const selectElement = screen.getByLabelText(/Risk Level/i);
    await user.selectOptions(selectElement, 'Low');

    const saveButton = screen.getByRole('button', { name: /Save Assessment/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('You must be logged in to save an assessment')).toBeInTheDocument();
    });
  });
});