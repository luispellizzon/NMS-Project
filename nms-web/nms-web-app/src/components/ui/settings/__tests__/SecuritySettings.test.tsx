// src/components/ui/settings/__tests__/SecuritySettings.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SecuritySettings from '../SecuritySettings';
import { useAuth } from '@/contexts/AuthContext';
import { changePassword } from '@/lib/firebase/auth-service';

// Mock dependencies
vi.mock('@/contexts/AuthContext');
vi.mock('@/lib/firebase/auth-service');

describe('SecuritySettings', () => {
  const mockUser = {
    uid: 'doctor-123',
    email: 'john@example.com',
    providerData: [{ providerId: 'password' }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should render password change form for email/password users', async () => {
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);

    render(<SecuritySettings />);

    expect(screen.getByText('Change Password')).toBeInTheDocument();

    await waitFor(() => {
      const passwordInputs = screen.getAllByDisplayValue('');
      expect(passwordInputs.length).toBeGreaterThan(0);
    });
  });

  it('should disable password change for OAuth users', () => {
    const oauthUser = {
      ...mockUser,
      providerData: [{ providerId: 'google.com' }],
    };

    vi.mocked(useAuth).mockReturnValue({ user: oauthUser } as any);

    render(<SecuritySettings />);

    expect(screen.getByText(/Password change is not available for OAuth accounts/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Current Password/i)).toBeDisabled();
    expect(screen.getByLabelText(/^New Password$/i)).toBeDisabled();
  });

  it('should successfully change password', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(changePassword).mockResolvedValue(undefined);

    render(<SecuritySettings />);

    const currentPasswordInput = screen.getByLabelText(/Current Password/i);
    const newPasswordInput = screen.getByLabelText(/^New Password$/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm New Password/i);

    await user.type(currentPasswordInput, 'oldpassword123');
    await user.type(newPasswordInput, 'newpassword123');
    await user.type(confirmPasswordInput, 'newpassword123');

    const submitButton = screen.getByRole('button', { name: /Update Password/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(changePassword).toHaveBeenCalledWith('oldpassword123', 'newpassword123');
      expect(screen.getByText('Password updated successfully!')).toBeInTheDocument();
    });

    // Check if form is reset
    expect(currentPasswordInput).toHaveValue('');
    expect(newPasswordInput).toHaveValue('');
    expect(confirmPasswordInput).toHaveValue('');
  });

  it('should show error if passwords do not match', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);

    render(<SecuritySettings />);

    const currentPasswordInput = screen.getByLabelText(/Current Password/i);
    const newPasswordInput = screen.getByLabelText(/^New Password$/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm New Password/i);

    await user.type(currentPasswordInput, 'oldpassword123');
    await user.type(newPasswordInput, 'newpassword123');
    await user.type(confirmPasswordInput, 'differentpassword');

    const submitButton = screen.getByRole('button', { name: /Update Password/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('New passwords do not match')).toBeInTheDocument();
      expect(changePassword).not.toHaveBeenCalled();
    });
  });

  it('should show error if new password is too short', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);

    render(<SecuritySettings />);

    const currentPasswordInput = screen.getByLabelText(/Current Password/i);
    const newPasswordInput = screen.getByLabelText(/^New Password$/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm New Password/i);

    await user.type(currentPasswordInput, 'oldpassword123');
    await user.type(newPasswordInput, 'short');
    await user.type(confirmPasswordInput, 'short');

    const submitButton = screen.getByRole('button', { name: /Update Password/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();
      expect(changePassword).not.toHaveBeenCalled();
    });
  });

  it('should handle wrong password error', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(changePassword).mockRejectedValue({ code: 'auth/wrong-password' });

    render(<SecuritySettings />);

    const currentPasswordInput = screen.getByLabelText(/Current Password/i);
    const newPasswordInput = screen.getByLabelText(/^New Password$/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm New Password/i);

    await user.type(currentPasswordInput, 'wrongpassword');
    await user.type(newPasswordInput, 'newpassword123');
    await user.type(confirmPasswordInput, 'newpassword123');

    const submitButton = screen.getByRole('button', { name: /Update Password/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Current password is incorrect.')).toBeInTheDocument();
    });
  });

  it('should handle weak password error', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(changePassword).mockRejectedValue({ code: 'auth/weak-password' });

    render(<SecuritySettings />);

    const currentPasswordInput = screen.getByLabelText(/Current Password/i);
    const newPasswordInput = screen.getByLabelText(/^New Password$/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm New Password/i);

    await user.type(currentPasswordInput, 'oldpassword123');
    await user.type(newPasswordInput, 'weakpass1');
    await user.type(confirmPasswordInput, 'weakpass1');

    const submitButton = screen.getByRole('button', { name: /Update Password/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('New password is too weak. Please choose a stronger password.')
      ).toBeInTheDocument();
    });
  });

  it('should handle requires-recent-login error', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(changePassword).mockRejectedValue({ code: 'auth/requires-recent-login' });

    render(<SecuritySettings />);

    const currentPasswordInput = screen.getByLabelText(/Current Password/i);
    const newPasswordInput = screen.getByLabelText(/^New Password$/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm New Password/i);

    await user.type(currentPasswordInput, 'oldpassword123');
    await user.type(newPasswordInput, 'newpassword123');
    await user.type(confirmPasswordInput, 'newpassword123');

    const submitButton = screen.getByRole('button', { name: /Update Password/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('Please sign out and sign in again before changing your password.')
      ).toBeInTheDocument();
    });
  });

  it('should show 2FA modal when enable button is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);

    render(<SecuritySettings />);

    const enableButton = screen.getByRole('button', { name: /Enable$/i });
    await user.click(enableButton);

    expect(screen.getByText('Enable Two-Factor Authentication')).toBeInTheDocument();
    expect(screen.getByText(/Download an authenticator app/i)).toBeInTheDocument();
  });

  it('should enable 2FA when confirmed', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);

    render(<SecuritySettings />);

    const enableButton = screen.getByRole('button', { name: /Enable$/i });
    await user.click(enableButton);

    const verificationInput = screen.getByPlaceholderText('000000');
    await user.type(verificationInput, '123456');

    const verifyButton = screen.getByRole('button', { name: /Verify & Enable/i });
    await user.click(verifyButton);

    await waitFor(() => {
      expect(screen.queryByText('Enable Two-Factor Authentication')).not.toBeInTheDocument();
      expect(screen.getByText('Two-factor authentication enabled!')).toBeInTheDocument();
      expect(screen.getByText('✓ Enabled')).toBeInTheDocument();
    });
  });

  it('should close 2FA modal on cancel', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);

    render(<SecuritySettings />);

    const enableButton = screen.getByRole('button', { name: /Enable$/i });
    await user.click(enableButton);

    expect(screen.getByText('Enable Two-Factor Authentication')).toBeInTheDocument();

    const cancelButton = screen.getAllByRole('button', { name: /Cancel/i })[0];
    await user.click(cancelButton);

    expect(screen.queryByText('Enable Two-Factor Authentication')).not.toBeInTheDocument();
  });

  it('should disable 2FA when disabled button is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);

    render(<SecuritySettings />);

    // Enable 2FA first
    const enableButton = screen.getByRole('button', { name: /Enable$/i });
    await user.click(enableButton);

    const verifyButton = screen.getByRole('button', { name: /Verify & Enable/i });
    await user.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByText('✓ Enabled')).toBeInTheDocument();
    });

    // Now disable it
    const disableButton = screen.getByText('Disable Two-Factor Authentication');
    await user.click(disableButton);

    expect(screen.queryByText('✓ Enabled')).not.toBeInTheDocument();
  });

  it('should render session management section', () => {
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);

    render(<SecuritySettings />);

    expect(screen.getByText('Session Management')).toBeInTheDocument();
    expect(screen.getByText('Active Sessions')).toBeInTheDocument();
    expect(screen.getByText(/Windows PC - Chrome/i)).toBeInTheDocument();
    expect(screen.getByText(/iPhone 14 - Safari/i)).toBeInTheDocument();
  });

  it('should change session timeout', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);

    render(<SecuritySettings />);

    const timeoutSelect = screen.getByLabelText(/Session Timeout/i) as HTMLSelectElement;
    expect(timeoutSelect.value).toBe('30');

    await user.selectOptions(timeoutSelect, '60');

    expect(timeoutSelect.value).toBe('60');
  });

  it('should display current session badge', () => {
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);

    render(<SecuritySettings />);

    expect(screen.getByText('Current')).toBeInTheDocument();
  });

  it('should show revoke button for non-current sessions', () => {
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);

    render(<SecuritySettings />);

    const revokeButtons = screen.getAllByText('Revoke');
    expect(revokeButtons).toHaveLength(1); // Only one non-current session
  });

  it('should clear success message after 3 seconds', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(changePassword).mockResolvedValue(undefined);

    render(<SecuritySettings />);

    const currentPasswordInput = screen.getByLabelText(/Current Password/i);
    const newPasswordInput = screen.getByLabelText(/^New Password$/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm New Password/i);

    await user.type(currentPasswordInput, 'oldpassword123');
    await user.type(newPasswordInput, 'newpassword123');
    await user.type(confirmPasswordInput, 'newpassword123');

    const submitButton = screen.getByRole('button', { name: /Update Password/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password updated successfully!')).toBeInTheDocument();
    });

    // Wait for the success message to disappear (setTimeout is 3000ms in the component)
    await waitFor(
      () => {
        expect(screen.queryByText('Password updated successfully!')).not.toBeInTheDocument();
      },
      { timeout: 4000 }
    );
  });

  it('should prevent OAuth users from changing password', () => {
    const oauthUser = {
      ...mockUser,
      providerData: [{ providerId: 'google.com' }],
    };

    vi.mocked(useAuth).mockReturnValue({ user: oauthUser } as any);

    render(<SecuritySettings />);

    const submitButton = screen.getByRole('button', { name: /Update Password/i });
    expect(submitButton).toBeDisabled();

    // Verify that the form inputs are also disabled
    expect(screen.getByLabelText(/Current Password/i)).toBeDisabled();
    expect(screen.getByLabelText(/^New Password$/i)).toBeDisabled();
    expect(screen.getByLabelText(/Confirm New Password/i)).toBeDisabled();
  });
});
