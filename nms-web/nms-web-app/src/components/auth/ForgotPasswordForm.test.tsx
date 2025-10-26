// src/components/auth/ForgotPasswordForm.test.tsx

import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPasswordForm from './ForgotPasswordForm';
import * as authService from '@/lib/firebase/auth-service';

vi.mock('@/lib/firebase/auth-service');

const mockedSendPasswordReset = authService.sendPasswordReset as Mock;

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form correctly', () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByRole('heading', { name: /forgot your password/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
  });

  it('shows a success message after submitting a valid email', async () => {
    const user = userEvent.setup();
    mockedSendPasswordReset.mockResolvedValue(undefined);

    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText(/email address/i), 'doctor@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(mockedSendPasswordReset).toHaveBeenCalledWith('doctor@example.com');
    });

    expect(await screen.findByText('Check your inbox')).toBeInTheDocument();
    // The form itself should be gone
    expect(screen.queryByRole('button', { name: /send reset link/i })).not.toBeInTheDocument();
  });

  it('shows the loading state while submitting', async () => {
    const user = userEvent.setup();
    mockedSendPasswordReset.mockImplementation(() => new Promise(() => {})); // Promise that never resolves

    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText(/email address/i), 'doctor@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    const loadingButton = screen.getByRole('button', { name: /sending link.../i });
    expect(loadingButton).toBeInTheDocument();
    expect(loadingButton).toBeDisabled();
  });

  it('shows a generic success message even if the user is not found (security)', async () => {
    const user = userEvent.setup();
    const firebaseError = { code: 'auth/user-not-found', message: 'User not found' };
    mockedSendPasswordReset.mockRejectedValue(firebaseError);

    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText(/email address/i), 'nonexistent@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    // It should still show the success message to prevent email enumeration
    expect(await screen.findByText('Check your inbox')).toBeInTheDocument();
    expect(screen.queryByText(/unexpected error/i)).not.toBeInTheDocument();
  });
});