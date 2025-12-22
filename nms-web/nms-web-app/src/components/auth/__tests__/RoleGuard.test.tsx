// src/components/auth/__tests__/RoleGuard.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RoleGuard from '../RoleGuard';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock AuthContext
const mockUseAuth = vi.fn();
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock FullScreenLoader
vi.mock('@/components/ui/common/FullScreenLoader', () => ({
  default: () => <div data-testid="loader">Loading...</div>,
}));

describe('RoleGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loader while auth is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      userRole: null,
    });

    render(
      <RoleGuard allowedRoles={['admin']}>
        <div>Protected Content</div>
      </RoleGuard>
    );

    expect(screen.getByTestId('loader')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to signin when user is not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      userRole: null,
    });

    render(
      <RoleGuard allowedRoles={['admin']}>
        <div>Protected Content</div>
      </RoleGuard>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/signin');
    });
  });

  it('redirects to custom URL when unauthenticated user and custom redirectUnauthenticated provided', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      userRole: null,
    });

    render(
      <RoleGuard allowedRoles={['admin']} redirectUnauthenticated="/custom-login">
        <div>Protected Content</div>
      </RoleGuard>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/custom-login');
    });
  });

  it('renders children when user has allowed role', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'test-user' },
      loading: false,
      userRole: 'admin',
    });

    render(
      <RoleGuard allowedRoles={['admin']}>
        <div>Protected Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('renders children when user role is in allowed roles array', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'test-user' },
      loading: false,
      userRole: 'doctor',
    });

    render(
      <RoleGuard allowedRoles={['admin', 'doctor']}>
        <div>Protected Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects unauthorized admin to admin dashboard', async () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'test-user' },
      loading: false,
      userRole: 'admin',
    });

    render(
      <RoleGuard allowedRoles={['doctor']}>
        <div>Doctor Only Content</div>
      </RoleGuard>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/dashboard');
    });
  });

  it('redirects unauthorized doctor to doctor dashboard', async () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'test-user' },
      loading: false,
      userRole: 'doctor',
    });

    render(
      <RoleGuard allowedRoles={['admin']}>
        <div>Admin Only Content</div>
      </RoleGuard>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('uses custom redirectUnauthorized when provided', async () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'test-user' },
      loading: false,
      userRole: 'doctor',
    });

    render(
      <RoleGuard allowedRoles={['admin']} redirectUnauthorized="/custom-redirect">
        <div>Admin Only Content</div>
      </RoleGuard>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/custom-redirect');
    });
  });

  it('shows custom fallback when provided', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      userRole: null,
    });

    render(
      <RoleGuard
        allowedRoles={['admin']}
        fallback={<div data-testid="custom-fallback">Custom Loading...</div>}
      >
        <div>Protected Content</div>
      </RoleGuard>
    );

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
  });

  it('shows loader when role is null but user exists', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'test-user' },
      loading: false,
      userRole: null,
    });

    render(
      <RoleGuard allowedRoles={['admin']}>
        <div>Protected Content</div>
      </RoleGuard>
    );

    expect(screen.getByTestId('loader')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
