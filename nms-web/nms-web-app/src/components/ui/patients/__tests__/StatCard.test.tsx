// src/components/ui/patients/StatCard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatCard from '../StatCard';
import { Activity } from 'lucide-react';

describe('StatCard', () => {
  it('renders title and value correctly', () => {
    render(<StatCard title="Total Patients" value={42} />);

    expect(screen.getByText('Total Patients')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders with string value', () => {
    render(<StatCard title="Status" value="Active" />);

    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders with icon when provided', () => {
    const { container } = render(
      <StatCard title="Activity" value={100} icon={<Activity data-testid="activity-icon" />} />
    );

    expect(screen.getByText('Activity')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByTestId('activity-icon')).toBeInTheDocument();
  });

  it('renders without icon when not provided', () => {
    const { container } = render(<StatCard title="Count" value={50} />);

    expect(screen.getByText('Count')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    // Verify no icon is rendered by checking the structure
    const iconContainer = container.querySelector('svg');
    expect(iconContainer).not.toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<StatCard title="Test" value={123} />);

    const card = container.querySelector('.bg-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('p-5', 'rounded-lg', 'border', 'shadow-sm');
  });
});