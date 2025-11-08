// src/components/ui/dashboard/GeographicDistributionCard.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GeographicDistributionCard from '../GeographicDistributionCard';
import { patientLocations } from '@/lib/mock_data';

// Mock the GeographicDistributionMap component since it uses Three.js
vi.mock('../GeographicDistributionMap', () => ({
  default: ({ targetLocation }: any) => (
    <div data-testid="geographic-map">
      {targetLocation && <div>Target: {targetLocation.city}</div>}
    </div>
  ),
}));

describe('GeographicDistributionCard', () => {
  const mockHandlers = {
    handleSearchSubmit: vi.fn((e) => e.preventDefault()),
    handleSearchChange: vi.fn(),
    handleClearSearch: vi.fn(),
    handleFilterClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with title', () => {
    render(
      <GeographicDistributionCard
        targetLocation={null}
        searchTerm=""
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Geographic Distribution')).toBeInTheDocument();
  });

  it('renders search bar with correct placeholder', () => {
    render(
      <GeographicDistributionCard
        targetLocation={null}
        searchTerm=""
        {...mockHandlers}
      />
    );

    expect(screen.getByPlaceholderText('Search location...')).toBeInTheDocument();
  });

  it('renders all location filter buttons', () => {
    render(
      <GeographicDistributionCard
        targetLocation={null}
        searchTerm=""
        {...mockHandlers}
      />
    );

    patientLocations.forEach((location) => {
      expect(screen.getByText(location.city)).toBeInTheDocument();
    });
  });

  it('calls handleSearchChange when typing in search bar', () => {
    render(
      <GeographicDistributionCard
        targetLocation={null}
        searchTerm=""
        {...mockHandlers}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search location...');
    fireEvent.change(searchInput, { target: { value: 'New York' } });

    expect(mockHandlers.handleSearchChange).toHaveBeenCalled();
  });

  it('calls handleClearSearch when clear button is clicked', () => {
    render(
      <GeographicDistributionCard
        targetLocation={null}
        searchTerm="test"
        {...mockHandlers}
      />
    );

    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);

    expect(mockHandlers.handleClearSearch).toHaveBeenCalled();
  });

  it('calls handleSearchSubmit when form is submitted', () => {
    render(
      <GeographicDistributionCard
        targetLocation={null}
        searchTerm="test"
        {...mockHandlers}
      />
    );

    const form = screen.getByPlaceholderText('Search location...').closest('form');
    if (form) {
      fireEvent.submit(form);
      expect(mockHandlers.handleSearchSubmit).toHaveBeenCalled();
    }
  });

  it('calls handleFilterClick when location button is clicked', () => {
    render(
      <GeographicDistributionCard
        targetLocation={null}
        searchTerm=""
        {...mockHandlers}
      />
    );

    const locationButton = screen.getByText(patientLocations[0].city);
    fireEvent.click(locationButton);

    expect(mockHandlers.handleFilterClick).toHaveBeenCalledWith(patientLocations[0]);
  });

  it('renders GeographicDistributionMap component', () => {
    render(
      <GeographicDistributionCard
        targetLocation={null}
        searchTerm=""
        {...mockHandlers}
      />
    );

    expect(screen.getByTestId('geographic-map')).toBeInTheDocument();
  });

  it('passes targetLocation to GeographicDistributionMap', () => {
    const targetLocation = patientLocations[0];

    render(
      <GeographicDistributionCard
        targetLocation={targetLocation}
        searchTerm=""
        {...mockHandlers}
      />
    );

    expect(screen.getByText(`Target: ${targetLocation.city}`)).toBeInTheDocument();
  });

  it('displays current search term in search bar', () => {
    render(
      <GeographicDistributionCard
        targetLocation={null}
        searchTerm="London"
        {...mockHandlers}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search location...') as HTMLInputElement;
    expect(searchInput.value).toBe('London');
  });

  it('renders DashboardCard with correct className', () => {
    const { container } = render(
      <GeographicDistributionCard
        targetLocation={null}
        searchTerm=""
        {...mockHandlers}
      />
    );

    const card = container.querySelector('.md\\:col-span-3');
    expect(card).toBeInTheDocument();
  });
});