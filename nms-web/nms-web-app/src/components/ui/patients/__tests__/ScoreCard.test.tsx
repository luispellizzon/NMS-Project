// src/components/ui/patients/__tests__/ScoreCard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ScoreCard from '../ScoreCard';

describe('ScoreCard', () => {
  it('renders score and status when test is completed', () => {
    render(
      <ScoreCard
        title="Speech"
        score={8}
        maxScore={10}
        status="Good"
        statusColor="#3b82f6"
      />
    );

    expect(screen.getByText('Speech')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('/10')).toBeInTheDocument();
    expect(screen.getByText('Good')).toBeInTheDocument();
    expect(screen.getByText('Good')).toHaveStyle('color: #3b82f6');
  });

  it('renders "Not Completed" when test is not completed', () => {
    render(
      <ScoreCard
        title="Memory"
        score={0}
        maxScore={0}
        status="Needs Attention"
        statusColor="#ef4444"
      />
    );

    expect(screen.getByText('Memory')).toBeInTheDocument();
    expect(screen.getByText('Not Completed')).toBeInTheDocument();
    expect(screen.queryByText('/0')).not.toBeInTheDocument();
    expect(screen.queryByText('Needs Attention')).not.toBeInTheDocument();
  });

  it('handles zero score correctly when test is completed', () => {
    render(
      <ScoreCard
        title="Cognitive"
        score={0}
        maxScore={20}
        status="Needs Attention"
        statusColor="#ef4444"
      />
    );

    expect(screen.getByText('Cognitive')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('/20')).toBeInTheDocument();
    expect(screen.getByText('Needs Attention')).toBeInTheDocument();
    expect(screen.getByText('Needs Attention')).toHaveStyle('color: #ef4444');
  });
});
