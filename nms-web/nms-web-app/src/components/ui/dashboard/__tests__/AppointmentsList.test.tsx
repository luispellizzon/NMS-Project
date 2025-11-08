// src/components/ui/dashboard/AppointmentsList.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AppointmentsList from '../AppointmentsList';
import type { Appointment } from '@/lib/mock_data';

describe('AppointmentsList', () => {
  const mockAppointments: Appointment[] = [
    {
      id: 'apt1',
      patientName: 'John Doe',
      testName: 'Memory Test',
      date: new Date('2025-11-14T10:00:00Z'),
      type: 'upcoming',
    },
    {
      id: 'apt2',
      patientName: 'Jane Smith',
      testName: 'Cognitive Exam',
      date: new Date('2025-11-15T14:00:00Z'),
      type: 'upcoming',
    },
  ];

  it('renders title correctly', () => {
    render(<AppointmentsList title="Upcoming Appointments" appointments={mockAppointments} />);

    expect(screen.getByText('Upcoming Appointments')).toBeInTheDocument();
  });

  it('renders all appointments', () => {
    render(<AppointmentsList title="Test" appointments={mockAppointments} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Memory Test')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Cognitive Exam')).toBeInTheDocument();
  });

  it('renders empty state when no appointments', () => {
    render(<AppointmentsList title="Test" appointments={[]} />);

    expect(screen.getByText('No appointments found.')).toBeInTheDocument();
  });

  it('shows time filter when showTimeFilter is true', () => {
    render(<AppointmentsList title="Test" appointments={mockAppointments} showTimeFilter={true} />);

    expect(screen.getByText('Day')).toBeInTheDocument();
    expect(screen.getByText('Week')).toBeInTheDocument();
    expect(screen.getByText('Month')).toBeInTheDocument();
  });

  it('does not show time filter when showTimeFilter is false', () => {
    render(<AppointmentsList title="Test" appointments={mockAppointments} showTimeFilter={false} />);

    expect(screen.queryByText('Day')).not.toBeInTheDocument();
    expect(screen.queryByText('Week')).not.toBeInTheDocument();
    expect(screen.queryByText('Month')).not.toBeInTheDocument();
  });

  it('defaults to not showing time filter', () => {
    render(<AppointmentsList title="Test" appointments={mockAppointments} />);

    expect(screen.queryByText('Day')).not.toBeInTheDocument();
  });

  it('can switch between filter periods', () => {
    render(<AppointmentsList title="Test" appointments={mockAppointments} showTimeFilter={true} />);

    const weekButton = screen.getByText('Week');
    const monthButton = screen.getByText('Month');
    const dayButton = screen.getByText('Day');

    // Default is week
    expect(weekButton).toHaveClass('bg-background');

    // Click month
    fireEvent.click(monthButton);
    expect(monthButton).toHaveClass('bg-background');

    // Click day
    fireEvent.click(dayButton);
    expect(dayButton).toHaveClass('bg-background');
  });

  it('renders patient avatars', () => {
    const { container } = render(<AppointmentsList title="Test" appointments={mockAppointments} />);

    const images = container.querySelectorAll('img');
    expect(images.length).toBe(mockAppointments.length);
  });

  it('formats dates correctly', () => {
    render(<AppointmentsList title="Test" appointments={mockAppointments} />);

    // Check that formatted dates appear (the component formats dates as full text)
    const dateTexts = screen.getAllByText(/2025/);
    expect(dateTexts.length).toBeGreaterThan(0);
    // Verify the formatted date structure
    expect(screen.getByText(/Friday, November 14, 2025/)).toBeInTheDocument();
  });
});