// src/components/ui/dashboard/GeographicDistributionMap/Tooltip.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Tooltip from '../Tooltip';
import type { PatientLocation } from '@/lib/mock_data';

describe('Tooltip', () => {
  const mockLocation: PatientLocation = {
    city: 'New York',
    lat: 40.7128,
    lon: -74.006,
    patientCount: 120,
    riskLevel: 'High',
    color: '#ff0000',
    scale: 1.5,
  };

  it('renders tooltip when visible and data is provided', () => {
    render(
      <Tooltip
        visible={true}
        data={mockLocation}
        pos={{ x: 100, y: 200 }}
      />
    );

    expect(screen.getByText('New York')).toBeInTheDocument();
    expect(screen.getByText(/Patients:/)).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
  });

  it('does not render when data is null', () => {
    const { container } = render(
      <Tooltip
        visible={true}
        data={null}
        pos={{ x: 100, y: 200 }}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('displays patient count correctly', () => {
    render(
      <Tooltip
        visible={true}
        data={mockLocation}
        pos={{ x: 100, y: 200 }}
      />
    );

    expect(screen.getByText('Patients:')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
  });

  it('displays risk level with correct color', () => {
    render(
      <Tooltip
        visible={true}
        data={mockLocation}
        pos={{ x: 100, y: 200 }}
      />
    );

    expect(screen.getByText('Risk Level:')).toBeInTheDocument();
    const riskText = screen.getByText('High');
    expect(riskText).toHaveStyle({ color: '#ff0000' });
  });

  it('positions tooltip based on mouse position', () => {
    const { container } = render(
      <Tooltip
        visible={true}
        data={mockLocation}
        pos={{ x: 150, y: 250 }}
      />
    );

    const tooltip = container.firstChild as HTMLElement;
    expect(tooltip).toHaveStyle({
      top: '265px', // y + 15
      left: '165px', // x + 15
    });
  });

  it('applies opacity-100 class when visible is true', () => {
    const { container } = render(
      <Tooltip
        visible={true}
        data={mockLocation}
        pos={{ x: 100, y: 200 }}
      />
    );

    const tooltip = container.firstChild;
    expect(tooltip).toHaveClass('opacity-100');
    expect(tooltip).not.toHaveClass('opacity-0');
  });

  it('applies opacity-0 class when visible is false', () => {
    const { container } = render(
      <Tooltip
        visible={false}
        data={mockLocation}
        pos={{ x: 100, y: 200 }}
      />
    );

    const tooltip = container.firstChild;
    expect(tooltip).toHaveClass('opacity-0');
    expect(tooltip).not.toHaveClass('opacity-100');
  });

  it('displays city name in bold', () => {
    render(
      <Tooltip
        visible={true}
        data={mockLocation}
        pos={{ x: 100, y: 200 }}
      />
    );

    const cityElement = screen.getByText('New York');
    expect(cityElement).toHaveClass('font-bold');
  });

  it('has pointer-events-none class to prevent interaction', () => {
    const { container } = render(
      <Tooltip
        visible={true}
        data={mockLocation}
        pos={{ x: 100, y: 200 }}
      />
    );

    const tooltip = container.firstChild;
    expect(tooltip).toHaveClass('pointer-events-none');
  });

  it('renders with different location data', () => {
    const differentLocation: PatientLocation = {
      city: 'London',
      lat: 51.5074,
      lon: -0.1278,
      patientCount: 85,
      riskLevel: 'Medium',
      color: '#ffaa00',
      scale: 1.2,
    };

    render(
      <Tooltip
        visible={true}
        data={differentLocation}
        pos={{ x: 50, y: 100 }}
      />
    );

    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });
});