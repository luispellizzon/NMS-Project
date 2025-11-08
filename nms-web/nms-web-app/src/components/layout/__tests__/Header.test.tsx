// src/components/layout/Header.test.tsx
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../Header';

// Mock next-themes for ThemeSwitcher
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

describe('Header', () => {
  const mockToggle = vi.fn();

  beforeEach(() => {
    mockToggle.mockClear();
  });

  it('renders header element', () => {
    const { container } = render(<Header onToggleMobileSidebar={mockToggle} />);

    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
  });

  it('renders mobile menu toggle button', () => {
    render(<Header onToggleMobileSidebar={mockToggle} />);

    const menuButton = screen.getByLabelText('Toggle menu');
    expect(menuButton).toBeInTheDocument();
  });

  it('calls onToggleMobileSidebar when menu button is clicked', () => {
    render(<Header onToggleMobileSidebar={mockToggle} />);

    const menuButton = screen.getByLabelText('Toggle menu');
    fireEvent.click(menuButton);

    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it('renders search bar with correct placeholder', () => {
    render(<Header onToggleMobileSidebar={mockToggle} />);

    const searchInput = screen.getByPlaceholderText('Search patients, reports...');
    expect(searchInput).toBeInTheDocument();
  });

  it('updates search term when typing', () => {
    render(<Header onToggleMobileSidebar={mockToggle} />);

    const searchInput = screen.getByPlaceholderText('Search patients, reports...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });

    expect(searchInput).toHaveValue('test search');
  });

  it('clears search when clear button is clicked', () => {
    render(<Header onToggleMobileSidebar={mockToggle} />);

    const searchInput = screen.getByPlaceholderText('Search patients, reports...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });

    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);

    expect(searchInput).toHaveValue('');
  });

  it('renders theme switcher', () => {
    const { container } = render(<Header onToggleMobileSidebar={mockToggle} />);

    // ThemeSwitcher renders a button
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(1); // Menu button + theme switcher + bell
  });

  it('renders notification bell icon', () => {
    const { container } = render(<Header onToggleMobileSidebar={mockToggle} />);

    // Bell icon from lucide-react
    const bell = container.querySelector('.lucide-bell');
    expect(bell).toBeInTheDocument();
  });

  it('has correct header styling classes', () => {
    const { container } = render(<Header onToggleMobileSidebar={mockToggle} />);

    const header = container.querySelector('header');
    expect(header).toHaveClass('flex', 'items-center', 'justify-between', 'bg-card', 'border-b');
  });
});