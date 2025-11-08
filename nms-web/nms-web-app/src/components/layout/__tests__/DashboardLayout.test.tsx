// src/components/layout/DashboardLayout.test.tsx
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DashboardLayout from '../DashboardLayout';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/dashboard',
}));

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      displayName: 'Test User',
      email: 'test@example.com',
      photoURL: '/images/logo.png',
    },
  }),
}));

// Mock firebase auth-service
vi.mock('@/lib/firebase/auth-service', () => ({
  logOut: vi.fn(),
}));

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
    resolvedTheme: 'light',
  }),
}));

// Mock window.matchMedia
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe('DashboardLayout', () => {
  it('renders children content', () => {
    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders Header component', () => {
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    // Header contains a search bar with specific placeholder
    expect(screen.getByPlaceholderText('Search patients, reports...')).toBeInTheDocument();
  });

  it('renders Sidebar component', () => {
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    // Sidebar contains logo text
    expect(screen.getByText('NeuroMind')).toBeInTheDocument();
  });

  it('has correct layout structure', () => {
    const { container } = render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass('flex-1');
  });

  it('toggles mobile sidebar when header menu button is clicked', () => {
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    const menuButton = screen.getByLabelText('Toggle menu');
    fireEvent.click(menuButton);

    // After clicking, the mobile sidebar backdrop should appear
    const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/60');
    expect(backdrop).toBeInTheDocument();
  });

  it('applies correct margin based on sidebar state', () => {
    const { container } = render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    const mainContainer = container.querySelector('.flex.flex-1.flex-col');
    expect(mainContainer).toHaveClass('lg:ml-64'); // Sidebar is expanded by default
  });
});