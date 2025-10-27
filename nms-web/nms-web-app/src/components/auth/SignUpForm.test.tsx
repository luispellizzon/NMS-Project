// src/components/auth/SignUpForm.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUpForm from './SignUpForm';
import * as authService from '@/lib/firebase/auth-service';
import { FirebaseError } from 'firebase/app';

vi.mock('@/lib/firebase/auth-service');

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockedAuthService = vi.mocked(authService);

describe('SignUpForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<SignUpForm />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /signup/i })).toBeInTheDocument();
  });

  it('successfully signs up and redirects on valid submission', async () => {
    const user = userEvent.setup();
    // Mock the successful resolution of the client-side function
    mockedAuthService.signUpWithEmail.mockResolvedValue({} as any);
    
    render(<SignUpForm />);

    // Fill out the form
    await user.type(screen.getByLabelText(/name/i), 'Test User');
    await user.type(screen.getByLabelText(/email address/i), 'success@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password123!');
    await user.click(screen.getByLabelText(/i agree to the/i));

    // Submit the form
    await user.click(screen.getByRole('button', { name: /signup/i }));

    // Assert that the correct function was called with the correct data
    await waitFor(() => {
      expect(mockedAuthService.signUpWithEmail).toHaveBeenCalledWith(
        'success@example.com',
        'Password123!',
        'Test User'
      );
    });

    // Assert that the redirect happened
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('displays a user-friendly error message when email is already in use', async () => {
    const user = userEvent.setup();
    const errorMessage = 'This email is already registered. Please sign in.';
    const firebaseError = new FirebaseError('auth/email-already-in-use', 'Firebase: Error (auth/email-already-in-use).');
    mockedAuthService.signUpWithEmail.mockRejectedValue(firebaseError);

    render(<SignUpForm />);

    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email address/i), 'fail@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByLabelText(/i agree to the/i));
    await user.click(screen.getByRole('button', { name: /signup/i }));

    // Assert that the correct error message is displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('displays a generic error for non-Firebase errors', async () => {
    const user = userEvent.setup();
    // Mock rejection with a generic Error to trigger the fallback message
    mockedAuthService.signUpWithEmail.mockRejectedValue(new Error('Something went wrong'));

    render(<SignUpForm />);
    
    await user.type(screen.getByLabelText(/name/i), 'Test User');
    await user.type(screen.getByLabelText(/email address/i), 'any@user.com');
    await user.type(screen.getByLabelText(/password/i), 'anypassword');
    await user.click(screen.getByLabelText(/i agree to the/i));
    await user.click(screen.getByRole('button', { name: /signup/i }));

    const errorElement = await screen.findByText('An unexpected error occurred during registration.');
    expect(errorElement).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('handles Google sign-in failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Google sign-in failed.';
    mockedAuthService.signInWithGoogle.mockRejectedValue(new Error(errorMessage));

    render(<SignUpForm />);
    await user.click(screen.getByRole('button', { name: /sign in with google/i }));

    const errorElement = await screen.findByText(errorMessage);
    expect(errorElement).toBeInTheDocument();
  });

  it('handles Apple sign-in failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Apple sign-in failed.';
    mockedAuthService.signInWithApple.mockRejectedValue(new Error(errorMessage));

    render(<SignUpForm />);
    await user.click(screen.getByRole('button', { name: /sign in with apple/i }));
    
    const errorElement = await screen.findByText(errorMessage);
    expect(errorElement).toBeInTheDocument();
  });
});