// src/components/auth/SignInForm.test.tsx
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignInForm from './SignInForm';
import * as authService from '@/lib/firebase/auth-service'; // Import our service
import { User } from 'firebase/auth';

vi.mock('@/lib/firebase/auth-service');

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  getAuth: vi.fn(),
}));

// Mock the router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockedSignIn = authService.signInWithEmail as Mock;
const mockedSignInWithGoogle = authService.signInWithGoogle as Mock;

describe('SignInForm', () => {
  beforeEach(() => {
    // Reset mocks before each test to ensure isolation
    vi.clearAllMocks();
  });

  it('renders all required form fields', () => {
    render(<SignInForm />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
  });

  it('successfully signs in and redirects on valid credentials', async () => {
    const user = userEvent.setup();
    const mockUser = { uid: 'user-abc-123' } as User;
    mockedSignIn.mockResolvedValue({ user: mockUser });

    render(<SignInForm />);

    await user.type(screen.getByLabelText(/email address/i), 'doctor@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    // Verify the correct SDK function was called
    await waitFor(() => {
      expect(mockedSignIn).toHaveBeenCalledWith('doctor@example.com', 'password123');
    });

    // Verify the user is redirected to the dashboard
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('displays a user-friendly error message on failed signin', async () => {
    const user = userEvent.setup();
    const firebaseError = new Error('Invalid credentials.');
    (firebaseError as any).code = 'auth/invalid-credential';
    mockedSignIn.mockRejectedValue(firebaseError);


    render(<SignInForm />);

    await user.type(screen.getByLabelText(/email address/i), 'wrong@user.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    const errorElement = await screen.findByText('Invalid email or password.');
    expect(errorElement).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows the loading state when the form is submitting', async () => {
    const user = userEvent.setup();
    mockedSignIn.mockImplementation(() => new Promise(() => { }));

    render(<SignInForm />);

    await user.type(screen.getByLabelText(/email address/i), 'user@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    // The button text should change and it should become disabled
    const loadingButton = await screen.findByRole('button', { name: /signing in.../i });
    expect(loadingButton).toBeInTheDocument();
    expect(loadingButton).toBeDisabled();
  });

  it('displays a generic error if the thrown error is not a standard Firebase error', async () => {
    const user = userEvent.setup();
    mockedSignIn.mockRejectedValue('A raw string error');

    render(<SignInForm />);

    await user.type(screen.getByLabelText(/email address/i), 'any@user.com');
    await user.type(screen.getByLabelText(/password/i), 'anypassword');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    const errorElement = await screen.findByText('An unexpected error occurred. Please try again.');
    expect(errorElement).toBeInTheDocument();
  });
});