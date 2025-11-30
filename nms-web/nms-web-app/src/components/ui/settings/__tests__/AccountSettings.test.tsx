// src/components/ui/settings/__tests__/AccountSettings.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AccountSettings from '../AccountSettings';
import { useAuth } from '@/contexts/AuthContext';
import {
  saveAccountPreferences,
  getAccountPreferences,
} from '@/lib/firebase/firestore-service';
import { deleteUserAccount } from '@/lib/firebase/auth-service';
import { useRouter } from 'next/navigation';

// Mock dependencies
vi.mock('@/contexts/AuthContext');
vi.mock('@/lib/firebase/firestore-service');
vi.mock('@/lib/firebase/auth-service');
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('AccountSettings', () => {
  const mockUser = {
    uid: 'doctor-123',
    email: 'john@example.com',
    providerData: [{ providerId: 'password' }],
  };

  const mockRouter = {
    push: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(useRouter).mockReturnValue(mockRouter as any);
  });

  it('should load and display existing preferences', async () => {
    const mockPreferences = {
      language: 'es',
      timezone: 'Europe/Paris',
      dateFormat: 'DD/MM/YYYY',
      profileVisibility: false,
      activityStatus: false,
      dataSharing: true,
    };

    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getAccountPreferences).mockResolvedValue(mockPreferences as any);

    render(<AccountSettings />);

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox') as HTMLSelectElement[];
      expect(selects[0].value).toBe('es'); // Language
      expect(selects[1].value).toBe('Europe/Paris'); // Timezone
      expect(selects[2].value).toBe('DD/MM/YYYY'); // Date Format
    });
  });

  it('should use default values when preferences are null', async () => {
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getAccountPreferences).mockResolvedValue(null);

    render(<AccountSettings />);

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox') as HTMLSelectElement[];
      expect(selects[0].value).toBe('en'); // Language
      expect(selects[1].value).toBe('America/New_York'); // Timezone
      expect(selects[2].value).toBe('MM/DD/YYYY'); // Date Format
    });
  });

  it('should successfully save account preferences', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getAccountPreferences).mockResolvedValue(null);
    vi.mocked(saveAccountPreferences).mockResolvedValue(undefined);

    render(<AccountSettings />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
    });

    const languageSelect = screen.getAllByRole('combobox')[0];
    await user.selectOptions(languageSelect, 'es');

    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(saveAccountPreferences).toHaveBeenCalledWith('doctor-123', {
        language: 'es',
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        privacy: {
          profileVisibility: true,
          activityStatus: true,
          dataSharing: false,
        },
      });
      expect(screen.getByText('Account settings saved successfully!')).toBeInTheDocument();
    });
  });

  it('should show error message on save failure', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getAccountPreferences).mockResolvedValue(null);
    vi.mocked(saveAccountPreferences).mockRejectedValue(new Error('Save failed'));

    render(<AccountSettings />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to save settings. Please try again.')).toBeInTheDocument();
    });
  });

  it('should toggle privacy settings checkboxes', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getAccountPreferences).mockResolvedValue(null);

    render(<AccountSettings />);

    await waitFor(() => {
      expect(screen.getByText(/Profile Visibility/i)).toBeInTheDocument();
    });

    const profileVisibilityCheckbox = screen
      .getByText(/Profile Visibility/i)
      .closest('label')!
      .querySelector('input[type="checkbox"]') as HTMLInputElement;

    expect(profileVisibilityCheckbox.checked).toBe(true);

    await user.click(profileVisibilityCheckbox);

    expect(profileVisibilityCheckbox.checked).toBe(false);
  });

  it('should show delete account modal when delete button is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getAccountPreferences).mockResolvedValue(null);

    render(<AccountSettings />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Delete Account/i })).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /Delete Account/i });
    await user.click(deleteButton);

    expect(screen.getByText('Delete Account?')).toBeInTheDocument();
    expect(screen.getByText(/This action cannot be undone/i)).toBeInTheDocument();
  });

  it('should successfully delete account for password users', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getAccountPreferences).mockResolvedValue(null);
    vi.mocked(deleteUserAccount).mockResolvedValue(undefined);

    render(<AccountSettings />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Delete Account/i })).toBeInTheDocument();
    });

    // Open modal
    const deleteButton = screen.getByRole('button', { name: /Delete Account/i });
    await user.click(deleteButton);

    // Enter password
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    await user.type(passwordInput, 'mypassword123');

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /Yes, Delete/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(deleteUserAccount).toHaveBeenCalledWith('mypassword123');
      expect(mockRouter.push).toHaveBeenCalledWith('/signin');
    });
  });

  it('should delete account for OAuth users without password', async () => {
    const oauthUser = {
      uid: 'doctor-123',
      email: 'john@example.com',
      providerData: [{ providerId: 'google.com' }],
    };

    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: oauthUser } as any);
    vi.mocked(getAccountPreferences).mockResolvedValue(null);
    vi.mocked(deleteUserAccount).mockResolvedValue(undefined);

    render(<AccountSettings />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Delete Account/i })).toBeInTheDocument();
    });

    // Open modal
    const deleteButton = screen.getByRole('button', { name: /Delete Account/i });
    await user.click(deleteButton);

    // No password field should be shown for OAuth users
    expect(screen.queryByPlaceholderText('Enter your password')).not.toBeInTheDocument();

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /Yes, Delete/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(deleteUserAccount).toHaveBeenCalledWith();
      expect(mockRouter.push).toHaveBeenCalledWith('/signin');
    });
  });

  it('should show error if password is empty for password users', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getAccountPreferences).mockResolvedValue(null);

    render(<AccountSettings />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Delete Account/i })).toBeInTheDocument();
    });

    // Open modal
    const deleteButton = screen.getByRole('button', { name: /Delete Account/i });
    await user.click(deleteButton);

    // Don't enter password, just confirm
    const confirmButton = screen.getByRole('button', { name: /Yes, Delete/i });
    await user.click(confirmButton);

    await waitFor(() => {
      const errorMessages = screen.getAllByText('Please enter your password to confirm deletion.');
      expect(errorMessages.length).toBeGreaterThan(0);
      expect(deleteUserAccount).not.toHaveBeenCalled();
    });
  });

  it('should handle wrong password error', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getAccountPreferences).mockResolvedValue(null);
    vi.mocked(deleteUserAccount).mockRejectedValue({ code: 'auth/wrong-password' });

    render(<AccountSettings />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Delete Account/i })).toBeInTheDocument();
    });

    // Open modal
    const deleteButton = screen.getByRole('button', { name: /Delete Account/i });
    await user.click(deleteButton);

    // Enter wrong password
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    await user.type(passwordInput, 'wrongpassword');

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /Yes, Delete/i });
    await user.click(confirmButton);

    await waitFor(() => {
      const errorMessages = screen.getAllByText('Incorrect password. Please try again.');
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  it('should handle requires-recent-login error', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getAccountPreferences).mockResolvedValue(null);
    vi.mocked(deleteUserAccount).mockRejectedValue({ code: 'auth/requires-recent-login' });

    render(<AccountSettings />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Delete Account/i })).toBeInTheDocument();
    });

    // Open modal
    const deleteButton = screen.getByRole('button', { name: /Delete Account/i });
    await user.click(deleteButton);

    // Enter password
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    await user.type(passwordInput, 'password123');

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /Yes, Delete/i });
    await user.click(confirmButton);

    await waitFor(() => {
      const errorMessages = screen.getAllByText('Please sign out and sign in again before deleting your account.');
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  it('should close delete modal on cancel', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getAccountPreferences).mockResolvedValue(null);

    render(<AccountSettings />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Delete Account/i })).toBeInTheDocument();
    });

    // Open modal
    const deleteButton = screen.getByRole('button', { name: /Delete Account/i });
    await user.click(deleteButton);

    expect(screen.getByText('Delete Account?')).toBeInTheDocument();

    // Click cancel
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);

    expect(screen.queryByText('Delete Account?')).not.toBeInTheDocument();
  });

  it('should clear success message after 3 seconds', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getAccountPreferences).mockResolvedValue(null);
    vi.mocked(saveAccountPreferences).mockResolvedValue(undefined);

    render(<AccountSettings />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Account settings saved successfully!')).toBeInTheDocument();
    });

    // Wait for the success message to disappear (setTimeout is 3000ms in the component)
    await waitFor(
      () => {
        expect(screen.queryByText('Account settings saved successfully!')).not.toBeInTheDocument();
      },
      { timeout: 4000 }
    );
  });
});
