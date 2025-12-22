'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Appointment } from '@/lib/mock_data';

// Helper to format dates
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const AppointmentItem = ({ appointment }: { appointment: Appointment }) => (
  <div className="flex items-center space-x-4 py-3 border-b last:border-b-0">
    <Image
      src="/images/Avatar.jpg"
      alt={appointment.patientName}
      width={40}
      height={40}
      className="rounded-full"
    />
    <div className="flex-1">
      <p className="font-semibold text-sm text-card-foreground">{appointment.patientName}</p>
      <p className="text-xs text-primary font-medium">{appointment.testName}</p>
    </div>
    <div className="text-right">
      <p className="text-sm text-muted-foreground">{formatDate(appointment.date)}</p>
    </div>
  </div>
);

interface AppointmentsListProps {
  title: string;
  appointments: Appointment[];
  showTimeFilter?: boolean;
}

export default function AppointmentsList({ title, appointments, showTimeFilter = false }: AppointmentsListProps) {
  const [filter, setFilter] = useState('week');

  return (
    <div className="bg-card p-6 rounded-xl border shadow-sm h-fit">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
        {showTimeFilter && (
          <div className="flex items-center space-x-1 bg-muted p-1 rounded-lg">
            {['Day', 'Week', 'Month'].map((period) => (
              <button
                key={period}
                onClick={() => setFilter(period.toLowerCase())}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  filter === period.toLowerCase()
                    ? 'bg-background text-primary shadow-sm'
                    : 'text-muted-foreground hover:bg-background/60'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-2">
        {appointments.length > 0 ? (
          appointments.map((apt) => <AppointmentItem key={apt.id} appointment={apt} />)
        ) : (
          <p className="text-center text-muted-foreground py-4">No appointments found.</p>
        )}
      </div>
    </div>
  );
}