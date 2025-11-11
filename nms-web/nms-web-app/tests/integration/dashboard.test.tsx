// tests/integration/dashboard.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardPage from '@/app/dashboard/page';

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
  it('should render all dashboard cards and components', () => {
    render(<DashboardPage />);

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