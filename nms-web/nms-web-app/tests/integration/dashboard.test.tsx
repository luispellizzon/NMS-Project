// tests/integration/dashboard.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from '@/app/dashboard/page';

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-123', email: 'test@example.com' },
    loading: false,
  }),
}));

// Mock dashboardAggregationService
vi.mock('@/lib/services/dashboardAggregationService', () => ({
  getDashboardStats: vi.fn().mockResolvedValue({
    totalPatients: 100,
    riskDistribution: { high: 20, moderate: 30, low: 50 },
    averageScores: { overall: 5.0, cognitive: 5.2, speech: 4.8, memory: 4.9 },
    completionRates: {
      cognitiveAssessment: 85,
      speechAssessment: 80,
      memoryAssessment: 75,
      riskAssessment: 90,
      imageDescription: 70,
    },
    demographicDistribution: {
      ageGroups: { '0-30': 10, '31-50': 30, '51-70': 40, '70+': 20 },
      gender: { male: 45, female: 53, other: 2 }
    },
    testingActivity: { totalTests: 500, lastMonthTests: 50, averageTestsPerPatient: 5 },
    clinicalAssessments: { total: 200, withNotes: 150 }
  })
}));

// Mock patient location service
vi.mock('@/lib/firebase/services/patient-location-service', () => ({
  getPatientLocationData: vi.fn().mockResolvedValue([
    { city: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060, count: 10 },
    { city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278, count: 8 },
  ])
}));

vi.mock('@/components/ui/dashboard/GeographicDistributionCard', () => ({
  default: () => <div data-testid="geo-dist-card">GeographicDistributionCard</div>,
}));

vi.mock('@/components/ui/dashboard/News/NewsFeed', () => ({
  default: () => <div data-testid="news-feed">NewsFeed</div>,
}));

vi.mock('@/components/ui/dashboard/ScoreRangeRadarChart', () => ({
  default: () => <div data-testid="radar-chart">ScoreRangeRadarChart</div>,
}));

vi.mock('@/components/ui/dashboard/AvgScores', () => ({
  default: () => <div data-testid="avg-scores">AvgScores</div>,
}));

vi.mock('@/components/ui/dashboard/PatientsDistributionChart', () => ({
  default: () => <div data-testid="patients-chart">PatientsDistributionChart</div>,
}));

vi.mock('@/components/ui/dashboard/AvgRiskAssessmentChart', () => ({
  default: () => <div data-testid="risk-chart">AvgRiskAssessmentChart</div>,
}));

vi.mock('@/components/ui/dashboard/OverallAppointmentsChart', () => ({
  default: () => <div data-testid="appointments-chart">OverallAppointmentsChart</div>,
}));

vi.mock('@/components/ui/dashboard/AppointmentsList', () => ({
  default: ({ title }: { title: string }) => <div data-testid={title.toLowerCase().replace(' ', '-')}>{title}</div>,
}));

describe('DashboardPage Integration Test', () => {
  it('should render all dashboard cards and components', async () => {
    render(<DashboardPage />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText(/loading dashboard data/i)).not.toBeInTheDocument();
    });

    // Verify that the simple card titles are present
    expect(screen.getByRole('heading', { name: /Score Range/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Avg Scores/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Patients/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Avg Risk Assessment/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Overall Appointments/i })).toBeInTheDocument();

    expect(screen.getByTestId('geo-dist-card')).toBeInTheDocument();
    expect(screen.getByTestId('news-feed')).toBeInTheDocument();

    // Verify the two appointment list components are rendered
    expect(screen.getByTestId('upcoming-appointments')).toBeInTheDocument();
    expect(screen.getByTestId('previous-appointments')).toBeInTheDocument();
  });
});