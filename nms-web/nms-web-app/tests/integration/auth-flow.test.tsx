// tests/integration/auth-flow.test.tsx
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUpForm from '@/components/auth/SignUpForm';
import SignInForm from '@/components/auth/SignInForm';
import * as authService from '@/lib/firebase/auth-service';
import { User } from 'firebase/auth';

// FIX: Mock the service layer, not the low-level firebase SDKs.
vi.mock('@/lib/firebase/auth-service');

// Mock for Firebase Functions (used by SignUpForm)
const mockRegisterCallable = vi.fn();
vi.mock('firebase/functions', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/functions')>();
  return {
    ...actual,
    getFunctions: vi.fn(),
    httpsCallable: vi.fn(() => mockRegisterCallable),
    FunctionsError: class FunctionsError extends Error {
      constructor(public code: string, public message: string) {
        super(message);
      }
    },
  };
});

// FIX: Mock for Firebase Auth SDK (used by SignInForm)
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  getAuth: vi.fn(() => ({
    onAuthStateChanged: vi.fn(() => vi.fn()),
  })),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  OAuthProvider: vi.fn(),
}));

// Mock the router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// FIX: Cast the mocked import to a Mock type for control in tests
const mockedSignIn = authService.signInWithEmail as Mock;

describe('Authentication Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRegisterCallable.mockClear();
    mockedSignIn.mockClear();
  });

  describe('Complete Sign Up Flow', () => {
    it('completes full signup flow from form submission to redirect', async () => {
      const user = userEvent.setup();
      mockRegisterCallable.mockResolvedValue({ data: { success: true } });

      render(<SignUpForm />);

      await user.type(screen.getByLabelText(/name/i), 'New User');
      await user.type(screen.getByLabelText(/email address/i), 'newuser@example.com');
      await user.type(screen.getByLabelText(/password/i), 'SecurePass123!');
      await user.click(screen.getByLabelText(/i agree to the/i));
      await user.click(screen.getByRole('button', { name: /signup/i }));

      await waitFor(() => {
        expect(mockRegisterCallable).toHaveBeenCalledWith({
          displayName: 'New User',
          email: 'newuser@example.com',
          password: 'SecurePass123!',
        });
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });
  });

  describe('Complete Sign In Flow', () => {
    it('completes full signin flow and redirects', async () => {
      const user = userEvent.setup();
      mockedSignIn.mockResolvedValue({ user: { uid: 'abc-123' } as User });

      render(<SignInForm />);

      await user.type(screen.getByLabelText(/email address/i), 'user@example.com');
      await user.type(screen.getByLabelText(/password/i), 'Password123!');
      await user.click(screen.getByRole('button', { name: /^sign in$/i }));

      await waitFor(() => {
        expect(mockedSignIn).toHaveBeenCalledWith('user@example.com', 'Password123!');
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('handles invalid credentials error on signin', async () => {
      const user = userEvent.setup();
      const firebaseError = new Error('Invalid credentials.');
      (firebaseError as any).code = 'auth/invalid-credential';
      mockedSignIn.mockRejectedValue(firebaseError);

      render(<SignInForm />);

      await user.type(screen.getByLabelText(/email address/i), 'wrong@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /^sign in$/i }));

      await waitFor(() => {
        expect(screen.getByText('Invalid email or password.')).toBeInTheDocument();
      });

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  // NOTE: Social Sign In flows still use the auth-service, so their mocks are different and correct.
  describe('Social Sign In Flows', () => {
    it('completes Google sign-in flow', async () => {
      const user = userEvent.setup();
      const mockUser = { uid: 'google-user-789' } as User;
      vi.spyOn(authService, 'signInWithGoogle').mockResolvedValue(mockUser);

      render(<SignInForm />);

      await user.click(screen.getByRole('button', { name: /sign in with google/i }));

      await waitFor(() => {
        expect(authService.signInWithGoogle).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('completes Apple sign-in flow using SignUpForm', async () => {
      const user = userEvent.setup();
      const mockUser = { uid: 'apple-user-101' } as User;
      vi.spyOn(authService, 'signInWithApple').mockResolvedValue(mockUser);

      render(<SignUpForm />);

      await user.click(screen.getByRole('button', { name: /sign in with apple/i }));

      await waitFor(() => {
        expect(authService.signInWithApple).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });
  });

  describe('Form Navigation', () => {
    it('navigates from signup to signin', () => {
      render(<SignUpForm />);
      const signInLink = screen.getByRole('link', { name: /sign in/i });
      expect(signInLink).toHaveAttribute('href', '/signin');
    });

    it('navigates from signin to signup', () => {
      render(<SignInForm />);
      const signUpLink = screen.getByRole('link', { name: /sign up/i });
      expect(signUpLink).toHaveAttribute('href', '/signup');
    });

    it('has forgot password link', () => {
      render(<SignInForm />);
      const forgotPasswordLink = screen.getByRole('link', { name: /forgot password/i });
      expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
    });
  });
});