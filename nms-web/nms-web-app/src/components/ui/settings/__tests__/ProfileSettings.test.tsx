// src/components/ui/settings/__tests__/ProfileSettings.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileSettings from '../ProfileSettings';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/lib/firebase/auth-service';
import { updateDoctorProfile, getDoctorProfile } from '@/lib/firebase/firestore-service';

// Mock dependencies
vi.mock('@/contexts/AuthContext');
vi.mock('@/lib/firebase/auth-service');
vi.mock('@/lib/firebase/firestore-service');
vi.mock('next/image', () => ({
  default: ({ src, alt, width, height, className }: any) => (
    <img src={src} alt={alt} width={width} height={height} className={className} />
  ),
}));

describe('ProfileSettings', () => {
  const mockUser = {
    uid: 'doctor-123',
    displayName: 'Dr. John Doe',
    email: 'john@example.com',
    photoURL: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    global.alert = vi.fn();
  });

  it('should show loading state initially', () => {
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getDoctorProfile).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<ProfileSettings />);

    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
  });

  it('should load and display existing profile data', async () => {
    const mockProfile = {
      fullName: 'Dr. John Doe',
      email: 'john@example.com',
      phone: '+1 (555) 123-4567',
      specialty: 'neurology',
      licenseNumber: 'MD123456',
      hospital: 'City General Hospital',
      bio: 'Experienced neurologist',
    };

    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getDoctorProfile).mockResolvedValue(mockProfile as any);

    render(<ProfileSettings />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Dr. John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('+1 (555) 123-4567')).toBeInTheDocument();
      expect(screen.getByDisplayValue('MD123456')).toBeInTheDocument();
      expect(screen.getByDisplayValue('City General Hospital')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Experienced neurologist')).toBeInTheDocument();
    });
  });

  it('should use fallback data from Firebase Auth when profile is null', async () => {
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getDoctorProfile).mockResolvedValue(null);

    render(<ProfileSettings />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Dr. John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    });
  });

  it('should update form fields when user types', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getDoctorProfile).mockResolvedValue(null);

    render(<ProfileSettings />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Dr. John Doe')).toBeInTheDocument();
    });

    const phoneInput = screen.getByPlaceholderText('+1 (555) 123-4567');
    await user.clear(phoneInput);
    await user.type(phoneInput, '+1 555-9876');

    expect(phoneInput).toHaveValue('+1 555-9876');
  });

  it('should successfully submit profile updates', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getDoctorProfile).mockResolvedValue({
      fullName: 'Dr. John Doe',
      email: 'john@example.com',
    } as any);
    vi.mocked(updateUserProfile).mockResolvedValue(undefined);
    vi.mocked(updateDoctorProfile).mockResolvedValue(undefined);

    render(<ProfileSettings />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
    });

    const phoneInput = screen.getByPlaceholderText('+1 (555) 123-4567');
    await user.type(phoneInput, '+1 555-1234');

    const submitButton = screen.getByRole('button', { name: /Save Changes/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(updateDoctorProfile).toHaveBeenCalledWith('doctor-123', {
        fullName: 'Dr. John Doe',
        phone: '+1 555-1234',
        specialty: '',
        licenseNumber: '',
        hospital: '',
        bio: '',
      });
      expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
    });
  });

  it('should update Firebase Auth display name if changed', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getDoctorProfile).mockResolvedValue({
      fullName: 'Dr. John Doe',
      email: 'john@example.com',
    } as any);
    vi.mocked(updateUserProfile).mockResolvedValue(undefined);
    vi.mocked(updateDoctorProfile).mockResolvedValue(undefined);

    render(<ProfileSettings />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Dr. John Doe')).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue('Dr. John Doe');
    await user.clear(nameInput);
    await user.type(nameInput, 'Dr. Jane Smith');

    const submitButton = screen.getByRole('button', { name: /Save Changes/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(updateUserProfile).toHaveBeenCalledWith('Dr. Jane Smith');
      expect(updateDoctorProfile).toHaveBeenCalled();
    });
  });

  it('should not update Firebase Auth display name if unchanged', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getDoctorProfile).mockResolvedValue({
      fullName: 'Dr. John Doe',
      email: 'john@example.com',
    } as any);
    vi.mocked(updateDoctorProfile).mockResolvedValue(undefined);

    render(<ProfileSettings />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /Save Changes/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(updateUserProfile).not.toHaveBeenCalled();
      expect(updateDoctorProfile).toHaveBeenCalled();
    });
  });

  it('should show error message on update failure', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getDoctorProfile).mockResolvedValue({
      fullName: 'Dr. John Doe',
      email: 'john@example.com',
    } as any);
    vi.mocked(updateDoctorProfile).mockRejectedValue(new Error('Update failed'));

    render(<ProfileSettings />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /Save Changes/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to update profile. Please try again.')).toBeInTheDocument();
    });
  });

  it('should disable submit button while loading', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getDoctorProfile).mockResolvedValue(null);
    vi.mocked(updateDoctorProfile).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<ProfileSettings />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /Save Changes/i });
    await user.click(submitButton);

    expect(screen.getByRole('button', { name: /Saving.../i })).toBeDisabled();
  });

  it('should handle photo upload button click', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getDoctorProfile).mockResolvedValue(null);

    render(<ProfileSettings />);

    await waitFor(() => {
      expect(screen.getByText('Upload new photo')).toBeInTheDocument();
    });

    const photoButton = screen.getByText('Upload new photo');
    await user.click(photoButton);

    expect(global.alert).toHaveBeenCalledWith(
      'Photo upload feature will be implemented with Firebase Storage'
    );
  });

  it('should handle cancel button click', async () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
    });

    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getDoctorProfile).mockResolvedValue(null);

    render(<ProfileSettings />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);

    expect(reloadMock).toHaveBeenCalled();
  });

  it('should display email field as disabled', async () => {
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getDoctorProfile).mockResolvedValue({
      fullName: 'Dr. John Doe',
      email: 'john@example.com',
    } as any);

    render(<ProfileSettings />);

    await waitFor(() => {
      const emailInput = screen.getByDisplayValue('john@example.com');
      expect(emailInput).toBeDisabled();
      expect(emailInput).toHaveAttribute('title', 'Email cannot be changed here');
    });
  });

  it('should select specialty from dropdown', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getDoctorProfile).mockResolvedValue(null);

    render(<ProfileSettings />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Dr. John Doe')).toBeInTheDocument();
    });

    const specialtySelect = screen.getByRole('combobox') as HTMLSelectElement;
    await user.selectOptions(specialtySelect, 'neurology');

    expect(specialtySelect.value).toBe('neurology');
  });

  it('should clear success message after 3 seconds', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getDoctorProfile).mockResolvedValue(null);
    vi.mocked(updateDoctorProfile).mockResolvedValue(undefined);

    render(<ProfileSettings />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /Save Changes/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
    });

    // Wait for the success message to disappear (setTimeout is 3000ms in the component)
    await waitFor(
      () => {
        expect(screen.queryByText('Profile updated successfully!')).not.toBeInTheDocument();
      },
      { timeout: 4000 }
    );
  });
});
