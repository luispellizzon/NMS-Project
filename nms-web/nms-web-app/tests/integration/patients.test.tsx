// tests/integration/patients.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PatientsPage from '@/app/patients/page';

// Mock Next.js router
const mockPush = vi.fn();
const mockRouter = {
  push: mockPush,
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
};

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/patients',
}));

// Mock the auth context
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-123', email: 'test@example.com' },
    loading: false,
  }),
}));

// Mock Firebase Firestore
vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');

  const mockPatientData: Record<string, any> = {
    '1': { fullName: 'Jenny Wilson' },
    '2': { fullName: 'Robert Fox' },
    '3': { fullName: 'Wade Warren' },
    '4': { fullName: 'Esther Howard' },
    '5': { fullName: 'Cameron Williamson' },
    '6': { fullName: 'Brooklyn Simmons' },
    '7': { fullName: 'Eleanor Pena' },
    '8': { fullName: 'Kristin Watson' },
  };

  return {
    ...actual,
    collection: vi.fn(() => ({})),
    query: vi.fn((ref, ...constraints) => ({ ref, constraints })),
    where: vi.fn((field, op, value) => ({ field, op, value })),
    getDocs: vi.fn((q: any) => {
      // Extract the patientId from the where clause
      const whereClause = q.constraints?.find((c: any) => c.field === '__name__');
      const patientId = whereClause?.value;

      if (patientId && mockPatientData[patientId]) {
        return Promise.resolve({
          empty: false,
          docs: [{
            data: () => mockPatientData[patientId]
          }]
        });
      }

      return Promise.resolve({ empty: true, docs: [] });
    }),
  };
});

// Mock the Firestore service
vi.mock('@/lib/firebase/firestore-service', () => ({
  getDoctorProfile: vi.fn().mockResolvedValue({
    id: 'doctor-123',
    fullName: 'Test Doctor',
    email: 'test@example.com',
    role: 'doctor',
  }),
  getDoctorPatients: vi.fn().mockResolvedValue(['1', '2', '3', '4', '5', '6', '7', '8']),
  getPatientRiskAssessment: vi.fn((patientId: string) => {
    const riskData: Record<string, any> = {
      '1': { age: 35, gender: 'Female', riskScore: 85, riskLevel: 'High', trend: 'Increasing', assessments: { cognitive: 82, speech: 88 }, lastCheck: '2025-01-10', nextAppointment: '2025-02-10' },
      '2': { age: 40, gender: 'Male', riskScore: 78, riskLevel: 'High', trend: 'Stable', assessments: { cognitive: 75, speech: 81 }, lastCheck: '2025-01-08', nextAppointment: '2025-02-08' },
      '3': { age: 50, gender: 'Male', riskScore: 82, riskLevel: 'High', trend: 'Increasing', assessments: { cognitive: 80, speech: 84 }, lastCheck: '2025-01-05', nextAppointment: '2025-02-05' },
      '4': { age: 33, gender: 'Female', riskScore: 55, riskLevel: 'Moderate', trend: 'Stable', assessments: { cognitive: 52, speech: 58 }, lastCheck: '2025-01-12', nextAppointment: '2025-02-12' },
      '5': { age: 37, gender: 'Male', riskScore: 48, riskLevel: 'Moderate', trend: 'Decreasing', assessments: { cognitive: 45, speech: 51 }, lastCheck: '2025-01-09', nextAppointment: '2025-02-09' },
      '6': { age: 30, gender: 'Female', riskScore: 52, riskLevel: 'Moderate', trend: 'Stable', assessments: { cognitive: 50, speech: 54 }, lastCheck: '2025-01-11', nextAppointment: '2025-02-11' },
      '7': { age: 45, gender: 'Female', riskScore: 25, riskLevel: 'Low', trend: 'Stable', assessments: { cognitive: 20, speech: 30 }, lastCheck: '2025-01-07', nextAppointment: '2025-02-07' },
      '8': { age: 32, gender: 'Female', riskScore: 88, riskLevel: 'High', trend: 'Increasing', assessments: { cognitive: 85, speech: 91 }, lastCheck: '2025-01-06', nextAppointment: '2025-02-06' },
    };
    return Promise.resolve(riskData[patientId] || null);
  }),
  addPatient: vi.fn().mockResolvedValue('new-patient-id'),
  assignPatientToDoctor: vi.fn().mockResolvedValue(undefined),
  removePatientFromDoctor: vi.fn().mockResolvedValue(undefined),
}));

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

// Mock the AssignPatientModal to prevent it from rendering and interfering
vi.mock('@/components/ui/patients/AssignPatientModal', () => ({
  default: ({ isOpen }: { isOpen: boolean }) => (isOpen ? <div data-testid="assign-patient-modal">Assign Patient Modal</div> : null),
}));


describe('PatientsPage Integration Test', () => {

  it('should render all initial components correctly', async () => {
    render(<PatientsPage />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /patients dashboard/i })).toBeInTheDocument();
    });

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

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Jenny Wilson')).toBeInTheDocument();
    });

    // Initially, 5 patients are shown (ITEMS_PER_PAGE)
    let table = screen.getByTestId('patient-table');
    expect(table.children.length).toBe(5);

    // Click 'High Risk' filter
    const highRiskButton = screen.getByRole('button', { name: /high risk/i });
    await user.click(highRiskButton);

    // Wait for filter to be applied
    await waitFor(() => {
      table = screen.getByTestId('patient-table');
      expect(table.children.length).toBe(4); // 4 high risk patients in mock data
    });

    // Now only high-risk patients should be in the table
    expect(screen.queryByText('Jenny Wilson')).toBeInTheDocument(); // High risk patient
    expect(screen.getByText('Robert Fox')).toBeInTheDocument(); // High risk patient
    expect(screen.getByText('Wade Warren')).toBeInTheDocument(); // High risk patient
    expect(screen.queryByText('Esther Howard')).not.toBeInTheDocument(); // Moderate risk
  });

  it('should filter the patient list based on the search term', async () => {
    const user = userEvent.setup();
    render(<PatientsPage />);

    // Wait for data to load completely by checking for actual patient data
    await waitFor(() => {
      expect(screen.getByText('Jenny Wilson')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search patient by name or id/i) as HTMLInputElement;

    // Use fireEvent to avoid the "Maximum update depth" error that occurs with userEvent.type
    fireEvent.change(searchInput, { target: { value: 'Robert Fox' } });

    // Wait for search filter to be applied
    await waitFor(() => {
      const table = screen.getByTestId('patient-table');
      expect(table.children.length).toBe(1);
    });

    expect(screen.getByText('Robert Fox')).toBeInTheDocument();
    expect(screen.queryByText('Jenny Wilson')).not.toBeInTheDocument();
  });

  it('should open the Add Patient modal when the button is clicked', async () => {
    const user = userEvent.setup();
    render(<PatientsPage />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add patient/i })).toBeInTheDocument();
    });

    // Modal should not be visible initially
    expect(screen.queryByTestId('add-patient-modal')).not.toBeInTheDocument();

    // Click the "Add Patient" button
    const addButton = screen.getByRole('button', { name: /add patient/i });
    await user.click(addButton);

    // Now the modal should be rendered
    expect(screen.getByTestId('add-patient-modal')).toBeInTheDocument();
  });
});