// src/components/layout/SideBar.test.tsx
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Sidebar from '../SideBar';
import { logOut } from '@/lib/firebase/auth-service';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/dashboard',
}));

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      displayName: 'John Doe',
      email: 'john@example.com',
      photoURL: '/images/logo.png',
    },
  }),
}));

// Mock firebase auth-service
vi.mock('@/lib/firebase/auth-service', () => ({
  logOut: vi.fn(),
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

describe('Sidebar', () => {
  const mockToggleSidebar = vi.fn();
  const mockSetMobileOpen = vi.fn();

  beforeEach(() => {
    mockToggleSidebar.mockClear();
    mockSetMobileOpen.mockClear();
    mockPush.mockClear();
    vi.clearAllMocks();
  });

  it('renders logo and brand name when not collapsed', () => {
    render(
      <Sidebar
        isCollapsed={false}
        toggleSidebar={mockToggleSidebar}
        isMobileOpen={false}
        setMobileOpen={mockSetMobileOpen}
      />
    );

    expect(screen.getByText('NeuroMind')).toBeInTheDocument();
    expect(screen.getByAltText('NeuroMind Logo')).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    render(
      <Sidebar
        isCollapsed={false}
        toggleSidebar={mockToggleSidebar}
        isMobileOpen={false}
        setMobileOpen={mockSetMobileOpen}
      />
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Patients')).toBeInTheDocument();
    expect(screen.getByText('Training')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders user information', () => {
    render(
      <Sidebar
        isCollapsed={false}
        toggleSidebar={mockToggleSidebar}
        isMobileOpen={false}
        setMobileOpen={mockSetMobileOpen}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('renders logout button', () => {
    render(
      <Sidebar
        isCollapsed={false}
        toggleSidebar={mockToggleSidebar}
        isMobileOpen={false}
        setMobileOpen={mockSetMobileOpen}
      />
    );

    expect(screen.getByText('Log out')).toBeInTheDocument();
  });

  it('calls logout and redirects when logout button is clicked', async () => {
    render(
      <Sidebar
        isCollapsed={false}
        toggleSidebar={mockToggleSidebar}
        isMobileOpen={false}
        setMobileOpen={mockSetMobileOpen}
      />
    );

    const logoutButton = screen.getByText('Log out');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(logOut).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/signin');
    });
  });

  it('renders collapse button when not collapsed', () => {
    render(
      <Sidebar
        isCollapsed={false}
        toggleSidebar={mockToggleSidebar}
        isMobileOpen={false}
        setMobileOpen={mockSetMobileOpen}
      />
    );

    const collapseButton = screen.getByLabelText('Collapse sidebar');
    expect(collapseButton).toBeInTheDocument();
  });

  it('renders expand button when collapsed', () => {
    render(
      <Sidebar
        isCollapsed={true}
        toggleSidebar={mockToggleSidebar}
        isMobileOpen={false}
        setMobileOpen={mockSetMobileOpen}
      />
    );

    const expandButton = screen.getByLabelText('Expand sidebar');
    expect(expandButton).toBeInTheDocument();
  });

  it('calls toggleSidebar when collapse/expand button is clicked', () => {
    render(
      <Sidebar
        isCollapsed={false}
        toggleSidebar={mockToggleSidebar}
        isMobileOpen={false}
        setMobileOpen={mockSetMobileOpen}
      />
    );

    const collapseButton = screen.getByLabelText('Collapse sidebar');
    fireEvent.click(collapseButton);

    expect(mockToggleSidebar).toHaveBeenCalledTimes(1);
  });

  it('renders mobile sidebar when isMobileOpen is true', () => {
    render(
      <Sidebar
        isCollapsed={false}
        toggleSidebar={mockToggleSidebar}
        isMobileOpen={true}
        setMobileOpen={mockSetMobileOpen}
      />
    );

    // Mobile sidebar should have close button
    const closeButton = screen.getByLabelText('Close menu');
    expect(closeButton).toBeInTheDocument();
  });

  it('calls setMobileOpen when close button is clicked in mobile view', () => {
    render(
      <Sidebar
        isCollapsed={false}
        toggleSidebar={mockToggleSidebar}
        isMobileOpen={true}
        setMobileOpen={mockSetMobileOpen}
      />
    );

    const closeButton = screen.getByLabelText('Close menu');
    fireEvent.click(closeButton);

    expect(mockSetMobileOpen).toHaveBeenCalledWith(false);
  });

  it('closes mobile sidebar when backdrop is clicked', () => {
    render(
      <Sidebar
        isCollapsed={false}
        toggleSidebar={mockToggleSidebar}
        isMobileOpen={true}
        setMobileOpen={mockSetMobileOpen}
      />
    );

    const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/60');
    expect(backdrop).toBeInTheDocument();

    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockSetMobileOpen).toHaveBeenCalledWith(false);
    }
  });

  it('renders navigation links with correct hrefs', () => {
    render(
      <Sidebar
        isCollapsed={false}
        toggleSidebar={mockToggleSidebar}
        isMobileOpen={false}
        setMobileOpen={mockSetMobileOpen}
      />
    );

    const dashboardLink = screen.getAllByRole('link').find(link => link.getAttribute('href') === '/dashboard');
    const patientsLink = screen.getAllByRole('link').find(link => link.getAttribute('href') === '/patients');
    const trainingLink = screen.getAllByRole('link').find(link => link.getAttribute('href') === '/training');

    expect(dashboardLink).toBeInTheDocument();
    expect(patientsLink).toBeInTheDocument();
    expect(trainingLink).toBeInTheDocument();
  });

  it('highlights the current page in navigation', () => {
    render(
      <Sidebar
        isCollapsed={false}
        toggleSidebar={mockToggleSidebar}
        isMobileOpen={false}
        setMobileOpen={mockSetMobileOpen}
      />
    );

    // Since pathname is mocked as '/dashboard', the Dashboard link should be highlighted
    const links = screen.getAllByRole('link');
    const dashboardLink = links.find(link => link.getAttribute('href') === '/dashboard');

    expect(dashboardLink).toHaveClass('bg-primary');
  });
});