// src/components/ui/dashboard/AvgScores.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AvgScores from '../AvgScores';

describe('AvgScores', () => {
  it('renders main score from mock data', () => {
    render(<AvgScores />);

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders main unit', () => {
    render(<AvgScores />);

    expect(screen.getByText('pts')).toBeInTheDocument();
  });

  it('renders main label', () => {
    render(<AvgScores />);

    expect(screen.getByText('Summary')).toBeInTheDocument();
  });

  it('renders all sub-scores', () => {
    render(<AvgScores />);

    expect(screen.getByText('Speech')).toBeInTheDocument();
    expect(screen.getByText('Cognition')).toBeInTheDocument();
    expect(screen.getByText('Memory')).toBeInTheDocument();
  });

  it('renders sub-score values', () => {
    render(<AvgScores />);

    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByText('5.2')).toBeInTheDocument();
    expect(screen.getByText('4.9')).toBeInTheDocument();
  });

  it('renders color indicators for each sub-score', () => {
    const { container } = render(<AvgScores />);

    const colorIndicators = container.querySelectorAll('.rounded-full');

    // Should have 3 color indicators for 3 sub-scores
    expect(colorIndicators.length).toBe(3);
  });

  it('applies correct colors to indicators', () => {
    const { container } = render(<AvgScores />);

    const colorIndicators = container.querySelectorAll('.rounded-full');

    // Check that color indicators have style attribute
    expect(colorIndicators[0]).toHaveStyle({ backgroundColor: '#8b5cf6' }); // Speech - purple
    expect(colorIndicators[1]).toHaveStyle({ backgroundColor: '#3b82f6' }); // Cognition - blue
    expect(colorIndicators[2]).toHaveStyle({ backgroundColor: '#10b981' }); // Memory - green
  });

  it('has proper structure with border separator', () => {
    const { container } = render(<AvgScores />);

    const separator = container.querySelector('.border-t');
    expect(separator).toBeInTheDocument();
  });

  it('positions main score elements correctly', () => {
    const { container } = render(<AvgScores />);

    const mainScore = screen.getByText('5');
    expect(mainScore).toHaveClass('text-6xl', 'font-bold');

    const mainUnit = screen.getByText('pts');
    expect(mainUnit).toHaveClass('text-lg');
  });

  it('renders sub-scores in flex layout', () => {
    const { container } = render(<AvgScores />);

    const subScoresContainer = container.querySelector('.justify-around');
    expect(subScoresContainer).toBeInTheDocument();
  });
});