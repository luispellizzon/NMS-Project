// src/components/ui/dashboard/PatientsDistributionChart.test.tsx
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import PatientsDistributionChart from '../PatientsDistributionChart';

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    resolvedTheme: 'light',
  }),
}));

// Mock window.matchMedia for next-themes
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

describe('PatientsDistributionChart', () => {
  it('renders total patient count', () => {
    render(<PatientsDistributionChart />);

    // Total = 400 + 300 = 700
    expect(screen.getByText('700')).toBeInTheDocument();
    expect(screen.getByText('Patients')).toBeInTheDocument();
  });

  it('renders chart container', () => {
    const { container } = render(<PatientsDistributionChart />);

    const chartContainer = container.querySelector('.h-54');
    expect(chartContainer).toBeInTheDocument();
  });

  it('renders with correct structure', () => {
    const { container } = render(<PatientsDistributionChart />);

    // Check for ResponsiveContainer (recharts renders this)
    const responsiveContainer = container.querySelector('.recharts-responsive-container');
    expect(responsiveContainer).toBeInTheDocument();
  });

  it('displays centered text overlay', () => {
    const { container } = render(<PatientsDistributionChart />);

    const overlay = container.querySelector('.absolute.inset-0');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass('flex', 'items-center', 'justify-center');
  });
});