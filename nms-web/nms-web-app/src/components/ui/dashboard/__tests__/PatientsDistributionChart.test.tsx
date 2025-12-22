// src/components/ui/dashboard/PatientsDistributionChart.test.tsx
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import PatientsDistributionChart from '../PatientsDistributionChart';
import { DashboardStats } from '@/lib/services/dashboardAggregationService';

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

// Mock dashboard stats data
const mockStats: DashboardStats = {
  totalPatients: 700,
  riskDistribution: {
    high: 100,
    moderate: 200,
    low: 400,
  },
  averageScores: {
    overall: 5.0,
    cognitive: 5.2,
    speech: 4.8,
    memory: 4.9,
  },
  completionRates: {
    cognitiveAssessment: 85,
    speechAssessment: 80,
    memoryAssessment: 75,
    riskAssessment: 90,
    imageDescription: 70,
  },
  demographicDistribution: {
    ageGroups: {
      '0-30': 100,
      '31-50': 200,
      '51-70': 250,
      '70+': 150,
    },
    gender: {
      male: 400,
      female: 300,
      other: 0,
    },
  },
  testingActivity: {
    totalTests: 500,
    lastMonthTests: 50,
    averageTestsPerPatient: 5,
  },
  clinicalAssessments: {
    total: 200,
    withNotes: 150,
  },
};

describe('PatientsDistributionChart', () => {
  it('renders total patient count', () => {
    render(<PatientsDistributionChart stats={mockStats} />);

    // Total = 400 + 300 = 700
    expect(screen.getByText('700')).toBeInTheDocument();
    expect(screen.getByText('Patients')).toBeInTheDocument();
  });

  it('renders chart container', () => {
    const { container } = render(<PatientsDistributionChart stats={null} />);

    const chartContainer = container.querySelector('.h-54');
    expect(chartContainer).toBeInTheDocument();
  });

  it('renders with correct structure', () => {
    const { container } = render(<PatientsDistributionChart stats={null} />);

    // Check for ResponsiveContainer (recharts renders this)
    const responsiveContainer = container.querySelector('.recharts-responsive-container');
    expect(responsiveContainer).toBeInTheDocument();
  });

  it('displays centered text overlay', () => {
    const { container } = render(<PatientsDistributionChart stats={null} />);

    const overlay = container.querySelector('.absolute.inset-0');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass('flex', 'items-center', 'justify-center');
  });
});