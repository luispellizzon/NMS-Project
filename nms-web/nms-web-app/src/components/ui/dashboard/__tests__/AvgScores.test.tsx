// src/components/ui/dashboard/AvgScores.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AvgScores from '../AvgScores';
import { DashboardStats } from '@/lib/services/dashboardAggregationService';

// Mock dashboard stats data
const mockStats: DashboardStats = {
  totalPatients: 100,
  riskDistribution: {
    high: 20,
    moderate: 30,
    low: 50,
  },
  averageScores: {
    overall: 5.0,
    cognitive: 5.2,
    speech: 4.8,
    memory: 4.9,
  },
  demographicDistribution: {
    ageGroups: {
      '18-30': 10,
      '31-50': 30,
      '51-70': 40,
      '71+': 20,
    },
    gender: {
      male: 45,
      female: 55,
    },
  },
  testActivity: {
    totalTests: 500,
    testsThisMonth: 50,
    averageTestsPerPatient: 5,
  },
  clinicalAssessments: {
    total: 200,
    pending: 10,
    completed: 190,
  },
};

describe('AvgScores', () => {
  it('renders main score from mock data', () => {
    render(<AvgScores stats={mockStats} />);

    expect(screen.getByText('5.0')).toBeInTheDocument();
  });

  it('renders main unit', () => {
    render(<AvgScores stats={mockStats} />);

    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('renders main label', () => {
    render(<AvgScores stats={mockStats} />);

    expect(screen.getByText('Overall Average')).toBeInTheDocument();
  });

  it('renders all sub-scores', () => {
    render(<AvgScores stats={mockStats} />);

    expect(screen.getByText('Speech')).toBeInTheDocument();
    expect(screen.getByText('Cognitive')).toBeInTheDocument();
    expect(screen.getByText('Memory')).toBeInTheDocument();
  });

  it('renders sub-score values', () => {
    render(<AvgScores stats={mockStats} />);

    expect(screen.getByText('4.8%')).toBeInTheDocument();
    expect(screen.getByText('5.2%')).toBeInTheDocument();
    expect(screen.getByText('4.9%')).toBeInTheDocument();
  });

  it('renders color indicators for each sub-score', () => {
    const { container } = render(<AvgScores stats={mockStats} />);

    const colorIndicators = container.querySelectorAll('.rounded-full');

    // Should have 3 color indicators for 3 sub-scores
    expect(colorIndicators.length).toBe(3);
  });

  it('applies correct colors to indicators', () => {
    const { container } = render(<AvgScores stats={mockStats} />);

    const colorIndicators = container.querySelectorAll('.rounded-full');

    // Check that color indicators have style attribute
    expect(colorIndicators[0]).toHaveStyle({ backgroundColor: '#3b82f6' }); // Cognitive - blue
    expect(colorIndicators[1]).toHaveStyle({ backgroundColor: '#10b981' }); // Speech - green
    expect(colorIndicators[2]).toHaveStyle({ backgroundColor: '#f59e0b' }); // Memory - orange
  });

  it('has proper structure with border separator', () => {
    const { container } = render(<AvgScores stats={mockStats} />);

    const separator = container.querySelector('.border-t');
    expect(separator).toBeInTheDocument();
  });

  it('positions main score elements correctly', () => {
    const { container } = render(<AvgScores stats={mockStats} />);

    const mainScore = screen.getByText('5.0');
    expect(mainScore).toHaveClass('text-6xl', 'font-bold');

    const mainUnit = screen.getByText('%');
    expect(mainUnit).toHaveClass('text-lg');
  });

  it('renders sub-scores in flex layout', () => {
    const { container } = render(<AvgScores stats={mockStats} />);

    const subScoresContainer = container.querySelector('.justify-around');
    expect(subScoresContainer).toBeInTheDocument();
  });

  it('handles null stats gracefully', () => {
    render(<AvgScores stats={null} />);

    // Should render with default values of 0
    expect(screen.getByText('0.0')).toBeInTheDocument();
    expect(screen.getByText('Overall Average')).toBeInTheDocument();
  });
});