// src/components/ui/patients/AddPatientModal.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddPatientModal from '../AddPatientModal';
import { addPatient } from '@/lib/firebase/firestore-service';

// Mock firestore-service
vi.mock('@/lib/firebase/firestore-service', () => ({
  addPatient: vi.fn(),
}));

describe('AddPatientModal', () => {
  const mockOnClose = vi.fn();
  const mockOnPatientAdded = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnPatientAdded.mockClear();
    vi.clearAllMocks();
  });

  it('renders modal when isOpen is true', () => {
    render(
      <AddPatientModal
        isOpen={true}
        onClose={mockOnClose}
        onPatientAdded={mockOnPatientAdded}
      />
    );

    expect(screen.getByText('Add New Patient')).toBeInTheDocument();
  });

  it('does not render modal when isOpen is false', () => {
    render(
      <AddPatientModal
        isOpen={false}
        onClose={mockOnClose}
        onPatientAdded={mockOnPatientAdded}
      />
    );

    expect(screen.queryByText('Add New Patient')).not.toBeInTheDocument();
  });

  it('renders all form fields', () => {
    render(
      <AddPatientModal
        isOpen={true}
        onClose={mockOnClose}
        onPatientAdded={mockOnPatientAdded}
      />
    );

    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Date of Birth')).toBeInTheDocument();
    // Gender is stored in risk_assessments, not collected here
  });

  it('renders Cancel and Add Patient buttons', () => {
    render(
      <AddPatientModal
        isOpen={true}
        onClose={mockOnClose}
        onPatientAdded={mockOnPatientAdded}
      />
    );

    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Add Patient')).toBeInTheDocument();
  });

  it('calls onClose when Cancel button is clicked', () => {
    render(
      <AddPatientModal
        isOpen={true}
        onClose={mockOnClose}
        onPatientAdded={mockOnPatientAdded}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('updates form fields when user types', () => {
    render(
      <AddPatientModal
        isOpen={true}
        onClose={mockOnClose}
        onPatientAdded={mockOnPatientAdded}
      />
    );

    const fullNameInput = screen.getByLabelText('Full Name') as HTMLInputElement;
    const emailInput = screen.getByLabelText('Email Address') as HTMLInputElement;

    fireEvent.change(fullNameInput, { target: { value: 'Jane Doe' } });
    fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });

    expect(fullNameInput.value).toBe('Jane Doe');
    expect(emailInput.value).toBe('jane@example.com');
  });

  it('successfully submits form and adds patient', async () => {
    const mockPatientId = 'patient-123';
    (addPatient as any).mockResolvedValue(mockPatientId);

    render(
      <AddPatientModal
        isOpen={true}
        onClose={mockOnClose}
        onPatientAdded={mockOnPatientAdded}
      />
    );

    // Fill out the form (gender is no longer collected here, it's in risk_assessments)
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText('Date of Birth'), { target: { value: '1990-01-15' } });

    // Submit the form
    const submitButton = screen.getByText('Add Patient');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(addPatient).toHaveBeenCalledWith({
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        dateOfBirth: '1990-01-15',
        role: 'patient',
      });
    });

    await waitFor(() => {
      expect(mockOnPatientAdded).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('shows loading state while submitting', async () => {
    (addPatient as any).mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('patient-123'), 100)));

    render(
      <AddPatientModal
        isOpen={true}
        onClose={mockOnClose}
        onPatientAdded={mockOnPatientAdded}
      />
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText('Date of Birth'), { target: { value: '1990-01-15' } });

    // Submit the form
    const submitButton = screen.getByText('Add Patient');
    fireEvent.click(submitButton);

    // Check loading state
    expect(screen.getByText('Adding...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Add Patient')).toBeInTheDocument();
    });
  });

  it('displays error message when submission fails', async () => {
    (addPatient as any).mockRejectedValue(new Error('Failed to add patient'));

    render(
      <AddPatientModal
        isOpen={true}
        onClose={mockOnClose}
        onPatientAdded={mockOnPatientAdded}
      />
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText('Date of Birth'), { target: { value: '1990-01-15' } });

    // Submit the form
    const submitButton = screen.getByText('Add Patient');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to add patient. Please try again.')).toBeInTheDocument();
    });

    // Modal should not close on error
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('disables submit button while loading', async () => {
    (addPatient as any).mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('patient-123'), 100)));

    render(
      <AddPatientModal
        isOpen={true}
        onClose={mockOnClose}
        onPatientAdded={mockOnPatientAdded}
      />
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText('Date of Birth'), { target: { value: '1990-01-15' } });

    const submitButton = screen.getByText('Add Patient');
    fireEvent.click(submitButton);

    // Button should be disabled during submission
    await waitFor(() => {
      const loadingButton = screen.getByText('Adding...');
      expect(loadingButton).toBeDisabled();
    });
  });

  it('creates patient with default values until risk assessment completed', async () => {
    const mockPatientId = 'patient-123';
    (addPatient as any).mockResolvedValue(mockPatientId);

    render(
      <AddPatientModal
        isOpen={true}
        onClose={mockOnClose}
        onPatientAdded={mockOnPatientAdded}
      />
    );

    // Fill out the form with a date of birth
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText('Date of Birth'), { target: { value: '1990-01-15' } });

    // Submit the form
    fireEvent.click(screen.getByText('Add Patient'));

    await waitFor(() => {
      expect(mockOnPatientAdded).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Jane Doe',
          age: 0, // Will be updated from risk assessment
          gender: 'Female', // Default, will be updated from risk assessment
          riskScore: 0,
          riskLevel: 'Low',
          trend: 'Stable',
        })
      );
    });
  });
});