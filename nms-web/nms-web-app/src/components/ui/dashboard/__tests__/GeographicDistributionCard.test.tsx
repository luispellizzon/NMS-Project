// src/components/ui/dashboard/GeographicDistributionCard.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GeographicDistributionCard from '../GeographicDistributionCard';
import { mockPatientLocations } from '@/tests/fixtures/location.fixtures';

// Mock the GeographicDistributionMap component since it uses Three.js
vi.mock('../GeographicDistributionMap', () => ({
  default: ({ targetLocation, patientLocations }: any) => (
    <div data-testid="geographic-map">
      {targetLocation && <div>Target: {targetLocation.city}</div>}
      {/* Mock the map but let the actual footer render */}
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
        patientLocations={mockPatientLocations}
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
        patientLocations={mockPatientLocations}
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
        patientLocations={mockPatientLocations}
        searchTerm=""
        {...mockHandlers}
      />
    );

    mockPatientLocations.forEach((location) => {
      // Use a flexible matcher since the button contains "City (count)"
      expect(screen.getByText((content, element) => {
        return element?.tagName === 'BUTTON' && content.includes(location.city);
      })).toBeInTheDocument();
    });
  });

  it('calls handleSearchChange when typing in search bar', () => {
    render(
      <GeographicDistributionCard
        targetLocation={null}
        patientLocations={mockPatientLocations}
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
        patientLocations={mockPatientLocations}
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
        patientLocations={mockPatientLocations}
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
        patientLocations={mockPatientLocations}
        searchTerm=""
        {...mockHandlers}
      />
    );

    // Use a flexible matcher since the button contains "City (count)"
    const locationButton = screen.getByText((content, element) => {
      return element?.tagName === 'BUTTON' && content.includes(mockPatientLocations[0].city);
    });
    fireEvent.click(locationButton);

    expect(mockHandlers.handleFilterClick).toHaveBeenCalledWith(mockPatientLocations[0]);
  });

  it('renders GeographicDistributionMap component', () => {
    render(
      <GeographicDistributionCard
        targetLocation={null}
        patientLocations={mockPatientLocations}
        searchTerm=""
        {...mockHandlers}
      />
    );

    expect(screen.getByTestId('geographic-map')).toBeInTheDocument();
  });

  it('passes targetLocation to GeographicDistributionMap', () => {
    const targetLocation = mockPatientLocations[0];

    render(
      <GeographicDistributionCard
        targetLocation={targetLocation}
        patientLocations={mockPatientLocations}
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
        patientLocations={mockPatientLocations}
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
        patientLocations={mockPatientLocations}
        searchTerm=""
        {...mockHandlers}
      />
    );

    const card = container.querySelector('.md\\:col-span-3');
    expect(card).toBeInTheDocument();
  });
});