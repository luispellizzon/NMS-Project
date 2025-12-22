// src/components/ui/settings/__tests__/NotificationSettings.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotificationSettings from '../NotificationSettings';
import { useAuth } from '@/contexts/AuthContext';
import {
  saveNotificationSettings,
  getNotificationSettings,
} from '@/lib/firebase/firestore-service';

// Mock dependencies
vi.mock('@/contexts/AuthContext');
vi.mock('@/lib/firebase/firestore-service');

describe('NotificationSettings', () => {
  const mockUser = {
    uid: 'doctor-123',
    email: 'john@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should load and display existing notification settings', async () => {
    const mockSettings = {
      email: {
        newPatient: false,
        riskAlert: false,
        weeklyReport: true,
        systemUpdates: false,
      },
      push: {
        newPatient: false,
        riskAlert: false,
        messages: true,
      },
      inApp: {
        newPatient: false,
        riskAlert: false,
        messages: false,
        mentions: false,
      },
    };

    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getNotificationSettings).mockResolvedValue(mockSettings as any);

    render(<NotificationSettings />);

    await waitFor(() => {
      // Check email notifications section - get the card container
      const emailHeading = screen.getByText('Email Notifications');
      const emailSection = emailHeading.closest('.bg-card');
      const emailCheckboxes = emailSection!.querySelectorAll('input[type="checkbox"]');

      expect(emailCheckboxes.length).toBeGreaterThan(0);
      expect((emailCheckboxes[0] as HTMLInputElement)?.checked).toBe(false); // newPatient
      expect((emailCheckboxes[1] as HTMLInputElement)?.checked).toBe(false); // riskAlert
      expect((emailCheckboxes[2] as HTMLInputElement)?.checked).toBe(true); // weeklyReport
      expect((emailCheckboxes[3] as HTMLInputElement)?.checked).toBe(false); // systemUpdates
    });
  });

  it('should use default values when settings are null', async () => {
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getNotificationSettings).mockResolvedValue(null);

    render(<NotificationSettings />);

    await waitFor(() => {
      const emailHeading = screen.getByText('Email Notifications');
      const emailSection = emailHeading.closest('.bg-card');
      const emailCheckboxes = emailSection!.querySelectorAll('input[type="checkbox"]');

      expect(emailCheckboxes.length).toBeGreaterThan(0);
      expect((emailCheckboxes[0] as HTMLInputElement)?.checked).toBe(true); // newPatient
      expect((emailCheckboxes[1] as HTMLInputElement)?.checked).toBe(true); // riskAlert
      expect((emailCheckboxes[2] as HTMLInputElement)?.checked).toBe(false); // weeklyReport
      expect((emailCheckboxes[3] as HTMLInputElement)?.checked).toBe(true); // systemUpdates
    });
  });

  it('should successfully save notification preferences', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getNotificationSettings).mockResolvedValue(null);
    vi.mocked(saveNotificationSettings).mockResolvedValue(undefined);

    render(<NotificationSettings />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Preferences/i })).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /Save Preferences/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(saveNotificationSettings).toHaveBeenCalledWith('doctor-123', {
        email: {
          newPatient: true,
          riskAlert: true,
          weeklyReport: false,
          systemUpdates: true,
        },
        push: {
          newPatient: true,
          riskAlert: true,
          messages: false,
        },
        inApp: {
          newPatient: true,
          riskAlert: true,
          messages: true,
          mentions: true,
        },
      });
      expect(screen.getByText('Notification preferences saved successfully!')).toBeInTheDocument();
    });
  });

  it('should toggle email notification checkboxes', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getNotificationSettings).mockResolvedValue(null);

    render(<NotificationSettings />);

    await waitFor(() => {
      expect(screen.getByText(/Email Notifications/i)).toBeInTheDocument();
    });

    // Get all checkboxes
    const allCheckboxes = screen.getAllByRole('checkbox');

    // Email section has first 4 checkboxes (newPatient, riskAlert, weeklyReport, systemUpdates)
    const newPatientCheckbox = allCheckboxes[0] as HTMLInputElement;

    expect(newPatientCheckbox.checked).toBe(true);

    await user.click(newPatientCheckbox);

    expect(newPatientCheckbox.checked).toBe(false);
  });

  it('should toggle push notification checkboxes', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getNotificationSettings).mockResolvedValue(null);

    render(<NotificationSettings />);

    await waitFor(() => {
      expect(screen.getByText('Push Notifications')).toBeInTheDocument();
    });

    // Get all checkboxes - push section starts at index 4 (after 4 email checkboxes)
    const allCheckboxes = screen.getAllByRole('checkbox');
    const messagesCheckbox = allCheckboxes[6] as HTMLInputElement; // 3rd checkbox in push section

    expect(messagesCheckbox.checked).toBe(false);

    await user.click(messagesCheckbox);

    expect(messagesCheckbox.checked).toBe(true);
  });

  it('should toggle in-app notification checkboxes', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getNotificationSettings).mockResolvedValue(null);

    render(<NotificationSettings />);

    await waitFor(() => {
      expect(screen.getByText('In-App Notifications')).toBeInTheDocument();
    });

    // Get all checkboxes - in-app section starts at index 7 (after 4 email + 3 push)
    const allCheckboxes = screen.getAllByRole('checkbox');
    const mentionsCheckbox = allCheckboxes[10] as HTMLInputElement; // 4th checkbox in in-app section

    expect(mentionsCheckbox.checked).toBe(true);

    await user.click(mentionsCheckbox);

    expect(mentionsCheckbox.checked).toBe(false);
  });

  it('should show error message on save failure', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getNotificationSettings).mockResolvedValue(null);
    vi.mocked(saveNotificationSettings).mockRejectedValue(new Error('Save failed'));

    render(<NotificationSettings />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Preferences/i })).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /Save Preferences/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to save preferences. Please try again.')).toBeInTheDocument();
    });
  });

  it('should disable save button while loading', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getNotificationSettings).mockResolvedValue(null);
    vi.mocked(saveNotificationSettings).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<NotificationSettings />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Preferences/i })).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /Save Preferences/i });
    await user.click(saveButton);

    expect(screen.getByRole('button', { name: /Saving.../i })).toBeDisabled();
  });

  it('should display push notification info message', async () => {
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getNotificationSettings).mockResolvedValue(null);

    render(<NotificationSettings />);

    await waitFor(() => {
      expect(
        screen.getByText(/Push notifications require browser permissions/i)
      ).toBeInTheDocument();
    });
  });

  it('should clear success message after 3 seconds', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getNotificationSettings).mockResolvedValue(null);
    vi.mocked(saveNotificationSettings).mockResolvedValue(undefined);

    render(<NotificationSettings />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Preferences/i })).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /Save Preferences/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Notification preferences saved successfully!')).toBeInTheDocument();
    });

    // Wait for the success message to disappear (setTimeout is 3000ms in the component)
    await waitFor(
      () => {
        expect(
          screen.queryByText('Notification preferences saved successfully!')
        ).not.toBeInTheDocument();
      },
      { timeout: 4000 }
    );
  });

  it('should handle error when loading settings', async () => {
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getNotificationSettings).mockRejectedValue(new Error('Load failed'));

    render(<NotificationSettings />);

    // Should still render with default values
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Preferences/i })).toBeInTheDocument();
    });
  });

  it('should render all notification sections', async () => {
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getNotificationSettings).mockResolvedValue(null);

    render(<NotificationSettings />);

    await waitFor(() => {
      expect(screen.getByText('Email Notifications')).toBeInTheDocument();
      expect(screen.getByText('Push Notifications')).toBeInTheDocument();
      expect(screen.getByText('In-App Notifications')).toBeInTheDocument();
    });
  });

  it('should save all three notification types together', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getNotificationSettings).mockResolvedValue(null);
    vi.mocked(saveNotificationSettings).mockResolvedValue(undefined);

    render(<NotificationSettings />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Preferences/i })).toBeInTheDocument();
    });

    // Toggle weekly report checkbox (3rd in email section = index 2)
    const allCheckboxes = screen.getAllByRole('checkbox');
    const weeklyReportCheckbox = allCheckboxes[2];
    await user.click(weeklyReportCheckbox);

    const saveButton = screen.getByRole('button', { name: /Save Preferences/i });
    await user.click(saveButton);

    await waitFor(() => {
      const call = vi.mocked(saveNotificationSettings).mock.calls[0];
      expect(call).toBeDefined();
      expect(call[0]).toBe('doctor-123');
      expect(call[1]).toHaveProperty('email');
      expect(call[1]).toHaveProperty('push');
      expect(call[1]).toHaveProperty('inApp');
      expect(call[1]?.email?.weeklyReport).toBe(true);
    });
  });
});
