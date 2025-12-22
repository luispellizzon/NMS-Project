// src/components/ui/dashboard/OverallAppointmentsChart.test.tsx
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import OverallAppointmentsChart from '../OverallAppointmentsChart';

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
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

describe('OverallAppointmentsChart', () => {
  it('renders chart container', () => {
    const { container } = render(<OverallAppointmentsChart />);

    const chartContainer = container.querySelector('.h-full');
    expect(chartContainer).toBeInTheDocument();
  });

  it('renders ResponsiveContainer', () => {
    const { container } = render(<OverallAppointmentsChart />);

    const responsiveContainer = container.querySelector('.recharts-responsive-container');
    expect(responsiveContainer).toBeInTheDocument();
  });
});