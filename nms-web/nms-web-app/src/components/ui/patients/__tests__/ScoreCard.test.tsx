// src/components/ui/patients/ScoreCard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ScoreCard from '../ScoreCard';

describe('ScoreCard', () => {
  it('renders all props correctly', () => {
    render(
      <ScoreCard
        title="Cognitive Assessment"
        score={75}
        maxScore={100}
        status="Good"
        statusColor="#22c55e"
      />
    );

    expect(screen.getByText('Cognitive Assessment')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('/100')).toBeInTheDocument();
    expect(screen.getByText('Good')).toBeInTheDocument();
  });

  it('applies correct status color', () => {
    render(
      <ScoreCard
        title="Test Score"
        score={50}
        maxScore={100}
        status="Warning"
        statusColor="#ff0000"
      />
    );

    const statusElement = screen.getByText('Warning');
    expect(statusElement).toHaveStyle({ color: '#ff0000' });
  });

  it('displays different score ranges', () => {
    const { rerender } = render(
      <ScoreCard
        title="Score"
        score={0}
        maxScore={10}
        status="Low"
        statusColor="#000"
      />
    );

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('/10')).toBeInTheDocument();

    rerender(
      <ScoreCard
        title="Score"
        score={10}
        maxScore={10}
        status="Perfect"
        statusColor="#000"
      />
    );

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Perfect')).toBeInTheDocument();
  });

  it('renders card with correct structure', () => {
    const { container } = render(
      <ScoreCard
        title="Test"
        score={5}
        maxScore={10}
        status="Medium"
        statusColor="#ffaa00"
      />
    );

    const card = container.querySelector('.bg-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('border', 'rounded-lg', 'p-6', 'text-center');
  });
});