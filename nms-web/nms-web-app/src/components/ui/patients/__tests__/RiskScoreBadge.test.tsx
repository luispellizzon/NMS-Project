// src/components/ui/patients/RiskScoreBadge.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RiskScoreBadge from '../RiskScoreBadge';

describe('RiskScoreBadge', () => {
  it('renders high risk badge correctly', () => {
    render(<RiskScoreBadge score={8.5} level="High" />);

    expect(screen.getByText('8.5 / 10')).toBeInTheDocument();
    const badge = screen.getByText('8.5 / 10');
    expect(badge).toHaveClass('bg-red-200', 'text-red-800');
  });

  it('renders moderate risk badge correctly', () => {
    render(<RiskScoreBadge score={5.3} level="Moderate" />);

    expect(screen.getByText('5.3 / 10')).toBeInTheDocument();
    const badge = screen.getByText('5.3 / 10');
    expect(badge).toHaveClass('bg-yellow-200', 'text-yellow-800');
  });

  it('renders low risk badge correctly', () => {
    render(<RiskScoreBadge score={2.1} level="Low" />);

    expect(screen.getByText('2.1 / 10')).toBeInTheDocument();
    const badge = screen.getByText('2.1 / 10');
    expect(badge).toHaveClass('bg-teal-200', 'text-teal-800');
  });

  it('formats score to one decimal place', () => {
    render(<RiskScoreBadge score={7.123456} level="High" />);

    expect(screen.getByText('7.1 / 10')).toBeInTheDocument();
  });

  it('handles whole numbers', () => {
    render(<RiskScoreBadge score={9} level="High" />);

    expect(screen.getByText('9.0 / 10')).toBeInTheDocument();
  });

  it('applies common classes to all risk levels', () => {
    const { container } = render(<RiskScoreBadge score={5} level="Moderate" />);

    const badge = screen.getByText('5.0 / 10');
    expect(badge).toHaveClass('px-3', 'py-1.5', 'rounded-md', 'text-sm', 'font-semibold', 'flex-shrink-0');
  });
});