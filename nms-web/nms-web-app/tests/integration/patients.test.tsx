// tests/integration/patients.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PatientsPage from '@/app/patients/page';

// Mock child components to isolate the PatientsPage logic
vi.mock('@/components/ui/patients/StatCard', () => ({
  default: ({ title, value }: { title: string; value: number }) => (
    <div data-testid={`stat-${title.toLowerCase().replace(' ', '-')}`}>
      {title}: {value}
    </div>
  ),
}));

vi.mock('@/components/ui/patients/PatientTable', () => ({
  default: ({ patients }: { patients: any[] }) => (
    <div data-testid="patient-table">
      {patients.map(p => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  ),
}));

vi.mock('@/components/ui/common/Pagination', () => ({
  default: ({ currentPage, totalPages }: { currentPage: number, totalPages: number }) => (
    <div data-testid="pagination">
      Page {currentPage} of {totalPages}
    </div>
  ),
}));

// Mock the AddPatientModal to prevent it from rendering and interfering
vi.mock('@/components/ui/patients/AddPatientModal', () => ({
  default: ({ isOpen }: { isOpen: boolean }) => (isOpen ? <div data-testid="add-patient-modal">Add Patient Modal</div> : null),
}));


describe('PatientsPage Integration Test', () => {

  it('should render all initial components correctly', () => {
    render(<PatientsPage />);

    // Check for header
    expect(screen.getByRole('heading', { name: /patients dashboard/i })).toBeInTheDocument();
    
    // Check for stat cards (based on mock data)
    expect(screen.getByTestId('stat-total-patients')).toHaveTextContent('Total Patients: 8');
    expect(screen.getByTestId('stat-high-risk')).toHaveTextContent('High Risk: 4');
    expect(screen.getByTestId('stat-moderate-risk')).toHaveTextContent('Moderate Risk: 3');
    expect(screen.getByTestId('stat-low-risk')).toHaveTextContent('Low Risk: 1');

    // Check for search, filters, and add button
    expect(screen.getByPlaceholderText(/search patient by name or id/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /high risk/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add patient/i })).toBeInTheDocument();

    // Check that the table and pagination are rendered
    expect(screen.getByTestId('patient-table')).toBeInTheDocument();
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });

  it('should filter the patient list when a risk filter is clicked', async () => {
    const user = userEvent.setup();
    render(<PatientsPage />);

    // Initially, 5 patients are shown (ITEMS_PER_PAGE)
    const table = screen.getByTestId('patient-table');
    expect(table.children.length).toBe(5);
    expect(screen.getByText('Jenny Wilson')).toBeInTheDocument();

    // Click 'High Risk' filter
    const highRiskButton = screen.getByRole('button', { name: /high risk/i });
    await user.click(highRiskButton);
    
    // Now only high-risk patients should be in the table
    // (Robert Fox and Wade Warren from mock data)
    expect(table.children.length).toBe(4); // 3 high risk patients in mock data
    expect(screen.queryByText('Jenny Wilson')).toBeInTheDocument(); // still on the first page
    expect(screen.getByText('Robert Fox')).toBeInTheDocument();
    expect(screen.getByText('Wade Warren')).toBeInTheDocument();
    expect(screen.queryByText('Esther Howard')).not.toBeInTheDocument(); // Moderate risk
  });

  it('should filter the patient list based on the search term', async () => {
    const user = userEvent.setup();
    render(<PatientsPage />);

    const searchInput = screen.getByPlaceholderText(/search patient by name or id/i);
    await user.type(searchInput, 'Robert Fox');

    const table = screen.getByTestId('patient-table');
    expect(table.children.length).toBe(1);
    expect(screen.getByText('Robert Fox')).toBeInTheDocument();
    expect(screen.queryByText('Jenny Wilson')).not.toBeInTheDocument();
  });

  it('should open the Add Patient modal when the button is clicked', async () => {
    const user = userEvent.setup();
    render(<PatientsPage />);

    // Modal should not be visible initially
    expect(screen.queryByTestId('add-patient-modal')).not.toBeInTheDocument();

    // Click the "Add Patient" button
    const addButton = screen.getByRole('button', { name: /add patient/i });
    await user.click(addButton);

    // Now the modal should be rendered
    expect(screen.getByTestId('add-patient-modal')).toBeInTheDocument();
  });
});