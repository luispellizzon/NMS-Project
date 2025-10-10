// src/contexts/AuthContext.test.tsx (Corrected)

import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, Mock, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import { User } from 'firebase/auth';

// Mock 'firebase/auth' to control onAuthStateChanged
vi.mock('firebase/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/auth')>();
  return {
    ...actual,
    onAuthStateChanged: vi.fn(),
  };
});

// Import the mocked function after the mock is defined
const { onAuthStateChanged } = await import('firebase/auth');
const onAuthStateChangedMock = onAuthStateChanged as Mock;

// A simple test component that consumes the context
const TestComponent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return <div>Welcome, {user.displayName}</div>;
  }

  return <div>Please sign in</div>;
};

describe('AuthProvider', () => {
  beforeEach(() => {
    onAuthStateChangedMock.mockClear();
  });

  it('should show loading state initially', () => {
    onAuthStateChangedMock.mockImplementation(() => () => {}); // Mock returns an unsubscribe function

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should provide a user when authenticated', async () => {
    const mockUser: User = {
      uid: '12345',
      displayName: 'Test User',
      email: 'test@example.com',
    } as User;

    onAuthStateChangedMock.mockImplementation((auth, callback) => {
      callback(mockUser);
      return () => {}; // Return a mock unsubscribe function
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText(`Welcome, ${mockUser.displayName}`)).toBeInTheDocument();
    });
  });

  it('should provide null when not authenticated', async () => {
    onAuthStateChangedMock.mockImplementation((auth, callback) => {
      callback(null);
      return () => {}; // Return a mock unsubscribe function
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Please sign in')).toBeInTheDocument();
    });
  });

  it('should throw an error if useAuth is used outside of AuthProvider', () => {
    // Suppress the expected console error from React to keep the test output clean
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const BrokenComponent = () => {
      useAuth(); // This will throw the error
      return null;
    };
    
    // --- THE FIX: Update the expected error message to match the implementation ---
    // We expect the render to throw an error with the correct message.
    expect(() => render(<BrokenComponent />)).toThrow('useAuth must be used within an AuthProvider');

    // Restore the console.error spy
    consoleErrorSpy.mockRestore();
  });
});