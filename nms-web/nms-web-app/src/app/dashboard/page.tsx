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
import GenericSearchBar from '@/components/ui/common/SearchBar';

export default function DashboardPage() {
  const [headerSearchTerm, setHeaderSearchTerm] = useState('');
  const [locationSearchTerm, setLocationSearchTerm] = useState('');
  const [targetLocation, setTargetLocation] = useState<PatientLocation | null>(null);

  // --- Create clear functions for each state ---
  const clearHeaderSearch = () => setHeaderSearchTerm('');
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
    <div className="w-full">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Risk Dashboard
        </h1>
        <div className="mt-4 md:mt-0 md:w-64">
          <GenericSearchBar
            value={headerSearchTerm}
            onChange={(e) => setHeaderSearchTerm(e.target.value)}
            onClear={clearHeaderSearch}
            placeholder="Search test results"
            className="border-gray-300/20 text-gray-300 focus:ring-[#0d7377]"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DashboardCard title="News">
            <NewsFeed />
          </DashboardCard>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <GeographicDistributionCard
              targetLocation={targetLocation}
              searchTerm={locationSearchTerm}
              handleSearchSubmit={handleLocationSearchSubmit}
              handleSearchChange={handleLocationSearchChange}
              handleClearSearch={clearLocationSearch} // Pass the new handler down
              handleFilterClick={handleFilterClick}
            />
            <DashboardCard title="Score Range" className="md:col-span-2">
              <ScoreRangeRadarChart />
            </DashboardCard>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DashboardCard title="Avg Scores"><AvgScores /></DashboardCard>
            <DashboardCard title="Patients"><PatientsDistributionChart /></DashboardCard>
            <DashboardCard title="Avg Risk Assessment"><AvgRiskAssessmentChart /></DashboardCard>
          </div>
        </div>
        <div className="lg:col-span-1 space-y-6">
          <DashboardCard title="Overall Appointments"><OverallAppointmentsChart /></DashboardCard>
          <AppointmentsList title="Upcoming Appointments" appointments={upcomingAppointments} />
          <AppointmentsList title="Previous Appointments" appointments={previousAppointments} showTimeFilter />
        </div>
      </div>
    </div>
  );
}