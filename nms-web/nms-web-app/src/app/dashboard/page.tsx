'use client';

import { useState } from 'react';
import { PatientLocation, patientLocations, appointmentsListData } from '@/lib/mock_data';
import GeographicDistributionCard from '@/components/ui/dashboard/GeographicDistributionCard';
import DashboardCard from '@/components/ui/dashboard/DashboardCard';
import NewsFeed from '@/components/ui/dashboard/News/NewsFeed';
import ScoreRangeRadarChart from '@/components/ui/dashboard/ScoreRangeRadarChart';
import AvgScores from '@/components/ui/dashboard/AvgScores';
import PatientsDistributionChart from '@/components/ui/dashboard/PatientsDistributionChart';
import AvgRiskAssessmentChart from '@/components/ui/dashboard/AvgRiskAssessmentChart';
import OverallAppointmentsChart from '@/components/ui/dashboard/OverallAppointmentsChart';
import AppointmentsList from '@/components/ui/dashboard/AppointmentsList';

export default function DashboardPage() {
  const [locationSearchTerm, setLocationSearchTerm] = useState('');
  const [targetLocation, setTargetLocation] = useState<PatientLocation | null>(null);

  const clearLocationSearch = () => setLocationSearchTerm('');

  const upcomingAppointments = appointmentsListData.filter(a => a.type === 'upcoming').sort((a, b) => a.date.getTime() - b.date.getTime());
  const previousAppointments = appointmentsListData.filter(a => a.type === 'previous').sort((a, b) => b.date.getTime() - a.date.getTime());

  const handleFilterClick = (location: PatientLocation) => {
    setTargetLocation(location);
    setLocationSearchTerm(location.city);
  };
  
  const handleLocationSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocationSearchTerm(event.target.value);
  };
  
  const handleLocationSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const foundLocation = patientLocations.find(
      loc => loc.city.toLowerCase().includes(locationSearchTerm.toLowerCase())
    );
    if (foundLocation) {
      setTargetLocation(foundLocation);
    } else {
        alert('Location not found.');
    }
  };

  return (
    // The main container for the dashboard content.
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- PRIMARY CONTENT COLUMN (LEFT) --- */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* News Card: Full width within this column */}
          <DashboardCard title="News">
            <NewsFeed />
          </DashboardCard>

          {/* Geo-distribution and Score Range Section */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <GeographicDistributionCard
              targetLocation={targetLocation}
              searchTerm={locationSearchTerm}
              handleSearchSubmit={handleLocationSearchSubmit}
              handleSearchChange={handleLocationSearchChange}
              handleClearSearch={clearLocationSearch}
              handleFilterClick={handleFilterClick}
            />
            <DashboardCard title="Score Range" className="md:col-span-2">
              <ScoreRangeRadarChart />
            </DashboardCard>
          </div>

          {/* Key Statistics Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DashboardCard title="Avg Scores"><AvgScores /></DashboardCard>
            <DashboardCard title="Patients"><PatientsDistributionChart /></DashboardCard>
            <DashboardCard title="Avg Risk Assessment"><AvgRiskAssessmentChart /></DashboardCard>
          </div>
        </div>

        {/* --- SECONDARY CONTENT COLUMN (RIGHT) --- */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <DashboardCard title="Overall Appointments">
            <OverallAppointmentsChart />
          </DashboardCard>

          <div className="flex flex-col gap-6">
            <AppointmentsList title="Upcoming Appointments" appointments={upcomingAppointments} />
            <AppointmentsList title="Previous Appointments" appointments={previousAppointments} showTimeFilter />
          </div>
        </div>
      </div>
    </div>
  );
}