// src/components/ui/dashboard/AvgRiskAssessmentChart.test.tsx
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import AvgRiskAssessmentChart from '../AvgRiskAssessmentChart';

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

describe('AvgRiskAssessmentChart', () => {
  it('renders chart container', async () => {
    const { container } = render(<AvgRiskAssessmentChart />);

    await waitFor(() => {
      const chartContainer = container.querySelector('.h-54');
      expect(chartContainer).toBeInTheDocument();
    });
  });

  it('renders ResponsiveContainer', async () => {
    const { container } = render(<AvgRiskAssessmentChart />);

    await waitFor(() => {
      const responsiveContainer = container.querySelector('.recharts-responsive-container');
      expect(responsiveContainer).toBeInTheDocument();
    });
  });

  it('renders percentage increase text', async () => {
    const { container } = render(<AvgRiskAssessmentChart />);

    await waitFor(() => {
      const percentText = container.querySelector('.text-4xl');
      expect(percentText).toBeInTheDocument();
      expect(percentText?.textContent).toContain('%');
    });
  });
});