// src/components/auth/SignUpForm.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUpForm from './SignUpForm';
import * as authService from '@/lib/firebase/auth-service';

const mockRegister = vi.fn();

vi.mock('firebase/functions', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/functions')>();
  return {
    ...actual,
    getFunctions: vi.fn(),
    httpsCallable: vi.fn(() => mockRegister),
    FunctionsError: class MockFunctionsError extends Error {
      constructor(public code: string, public message: string) {
        super(message);
        this.name = 'FunctionsError';
      }
    },
  };
});

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

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

  it('displays a user-friendly error message on failed signup', async () => {
    const user = userEvent.setup();
    const errorMessage = 'An account with this email address already exists.';
    const functionsError = new (await vi.importActual<typeof import('firebase/functions')>('firebase/functions')).FunctionsError('already-exists', errorMessage);
    mockRegister.mockRejectedValue(functionsError);

    render(<SignUpForm />);

    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email address/i), 'fail@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByLabelText(/i agree to the/i));
    await user.click(screen.getByRole('button', { name: /signup/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('successfully signs up and redirects', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue({ data: { success: true } });
    render(<SignUpForm />);

    await user.type(screen.getByLabelText(/name/i), 'Test User');
    await user.type(screen.getByLabelText(/email address/i), 'success@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password123!');
    await user.click(screen.getByLabelText(/i agree to the/i));

    await user.click(screen.getByRole('button', { name: /signup/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('handles Google sign-in failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Google sign-in failed.';
    vi.spyOn(authService, 'signInWithGoogle').mockRejectedValue(new Error(errorMessage));

    render(<SignUpForm />);

    await user.click(screen.getByRole('button', { name: /sign in with google/i }));

    const errorElement = await screen.findByText(errorMessage);
    expect(errorElement).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('handles Apple sign-in failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Apple sign-in failed.';
    vi.spyOn(authService, 'signInWithApple').mockRejectedValue(new Error(errorMessage));

    render(<SignUpForm />);

    await user.click(screen.getByRole('button', { name: /sign in with apple/i }));

    const errorElement = await screen.findByText(errorMessage);
    expect(errorElement).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('displays a generic error if the thrown error has no message', async () => {
    const user = userEvent.setup();
    // Mock the rejection with an empty object, forcing the fallback
    mockRegister.mockRejectedValue({});

    render(<SignUpForm />);

    await user.type(screen.getByLabelText(/name/i), 'Test User');
    await user.type(screen.getByLabelText(/email address/i), 'any@user.com');
    await user.type(screen.getByLabelText(/password/i), 'anypassword');
    await user.click(screen.getByLabelText(/i agree to the/i));
    await user.click(screen.getByRole('button', { name: /signup/i }));

    // Assert that the component's FALLBACK error message is displayed
    const errorElement = await screen.findByText('An unexpected error occurred during registration.');
    expect(errorElement).toBeInTheDocument();
  });
});