// src/components/ui/common/ThemeSwitcher.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ThemeSwitcher from '../ThemeSwitcher';

// Mock next-themes
const mockSetTheme = vi.fn();
const mockUseTheme = vi.fn();

vi.mock('next-themes', () => ({
  useTheme: () => mockUseTheme(),
}));

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    mockSetTheme.mockClear();
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    });
  });

  it('renders theme switcher after mounting', async () => {
    const { container } = render(<ThemeSwitcher />);

    // Component should render after mounting
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  it('renders theme switcher button after mounting', async () => {
    render(<ThemeSwitcher />);

    await waitFor(() => {
      expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument();
    });
  });

  it('displays current theme name', async () => {
    render(<ThemeSwitcher />);

    await waitFor(() => {
      expect(screen.getByText('Light')).toBeInTheDocument();
    });
  });

  it('opens dropdown when button is clicked', async () => {
    render(<ThemeSwitcher />);

    await waitFor(() => {
      const button = screen.getByRole('button', { expanded: false });
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(screen.getByText('Dark')).toBeInTheDocument();
      expect(screen.getByText('System')).toBeInTheDocument();
    });
  });

  it('changes theme when option is selected', async () => {
    render(<ThemeSwitcher />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      fireEvent.click(button);
    });

    await waitFor(() => {
      const darkOption = screen.getByText('Dark');
      fireEvent.click(darkOption);
    });

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('closes dropdown after selecting a theme', async () => {
    render(<ThemeSwitcher />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      fireEvent.click(button);
    });

    await waitFor(() => {
      const darkOption = screen.getByText('Dark');
      fireEvent.click(darkOption);
    });

    // Wait for dropdown to close
    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('shows all three theme options', async () => {
    render(<ThemeSwitcher />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      fireEvent.click(button);
    });

    await waitFor(() => {
      // Use getAllByText since "Light" appears in both button and dropdown
      const lightElements = screen.getAllByText('Light');
      expect(lightElements.length).toBeGreaterThan(0);
      expect(screen.getByText('Dark')).toBeInTheDocument();
      expect(screen.getByText('System')).toBeInTheDocument();
    });
  });

  it('highlights current theme in dropdown', async () => {
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
    });

    render(<ThemeSwitcher />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      fireEvent.click(button);
    });

    await waitFor(() => {
      const darkButton = screen.getAllByText('Dark')[0].closest('button');
      expect(darkButton).toHaveClass('bg-accent');
    });
  });
});