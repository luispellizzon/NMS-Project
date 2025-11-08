// src/components/ui/dashboard/ScoreRangeRadarChart.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ScoreRangeRadarChart from '../ScoreRangeRadarChart';

describe('ScoreRangeRadarChart', () => {
  it('renders chart container', () => {
    const { container } = render(<ScoreRangeRadarChart />);

    const chartContainer = container.querySelector('.h-64');
    expect(chartContainer).toBeInTheDocument();
  });

  it('renders ResponsiveContainer', () => {
    const { container } = render(<ScoreRangeRadarChart />);

    const responsiveContainer = container.querySelector('.recharts-responsive-container');
    expect(responsiveContainer).toBeInTheDocument();
  });
});