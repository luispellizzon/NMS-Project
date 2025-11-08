// src/components/ui/dashboard/GeographicDistributionMap/index.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import GeographicDistributionMap from '../index';
import { patientLocations } from '@/lib/mock_data';

// Mock Globe component
vi.mock('../Globe', () => ({
  default: ({ targetLocation, onHover }: any) => (
    <div data-testid="globe-component">
      {targetLocation && <div>Target: {targetLocation.city}</div>}
      <button onClick={() => onHover(patientLocations[0], { x: 100, y: 200 })}>
        Trigger Hover
      </button>
    </div>
  ),
}));

// Mock Tooltip component
vi.mock('../Tooltip', () => ({
  default: vi.fn(({ data, visible, pos }: any) => (
    <div data-testid="tooltip-component">
      {visible && data && (
        <div>
          <div>City: {data.city}</div>
          <div>Position: {pos.x}, {pos.y}</div>
        </div>
      )}
    </div>
  )),
}));

describe('GeographicDistributionMap', () => {
  it('renders without crashing', () => {
    render(<GeographicDistributionMap targetLocation={null} />);

    expect(screen.getByTestId('globe-component')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip-component')).toBeInTheDocument();
  });

  it('renders Globe component', () => {
    render(<GeographicDistributionMap targetLocation={null} />);

    expect(screen.getByTestId('globe-component')).toBeInTheDocument();
  });

  it('renders Tooltip component', () => {
    render(<GeographicDistributionMap targetLocation={null} />);

    expect(screen.getByTestId('tooltip-component')).toBeInTheDocument();
  });

  it('passes targetLocation to Globe', () => {
    const targetLocation = patientLocations[0];

    render(<GeographicDistributionMap targetLocation={targetLocation} />);

    expect(screen.getByText(`Target: ${targetLocation.city}`)).toBeInTheDocument();
  });

  it('has correct container classes', () => {
    const { container } = render(<GeographicDistributionMap targetLocation={null} />);

    const mapContainer = container.firstChild;
    expect(mapContainer).toHaveClass('relative', 'h-full', 'w-full', 'min-h-[250px]');
  });

  it('handles hover events from Globe', async () => {
    render(<GeographicDistributionMap targetLocation={null} />);

    const hoverButton = screen.getByText('Trigger Hover');
    hoverButton.click();

    // After hover, tooltip should show the location data
    await waitFor(() => {
      expect(screen.getByText(`City: ${patientLocations[0].city}`)).toBeInTheDocument();
      expect(screen.getByText('Position: 100, 200')).toBeInTheDocument();
    });
  });

  it('initializes with null tooltip data', () => {
    const { container } = render(<GeographicDistributionMap targetLocation={null} />);

    // Initially, tooltip should not show city data
    expect(screen.queryByText(/City:/)).not.toBeInTheDocument();
  });
});