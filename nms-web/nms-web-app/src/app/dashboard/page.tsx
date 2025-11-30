'use client';

import { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { PatientLocation } from '@/types/location';
import { appointmentsListData } from '@/lib/mock_data';
import GeographicDistributionCard from '@/components/ui/dashboard/GeographicDistributionCard';
import DashboardCard from '@/components/ui/dashboard/DashboardCard';
import NewsFeed from '@/components/ui/dashboard/News/NewsFeed';
import ScoreRangeRadarChart from '@/components/ui/dashboard/ScoreRangeRadarChart';
import AvgScores from '@/components/ui/dashboard/AvgScores';
import PatientsDistributionChart from '@/components/ui/dashboard/PatientsDistributionChart';
import AvgRiskAssessmentChart from '@/components/ui/dashboard/AvgRiskAssessmentChart';
import OverallAppointmentsChart from '@/components/ui/dashboard/OverallAppointmentsChart';
import AppointmentsList from '@/components/ui/dashboard/AppointmentsList';
import { getDashboardStats, DashboardStats } from '@/lib/services/dashboardAggregationService';
import { getPatientLocationData } from '@/lib/firebase/services/patient-location-service';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

// Animation variants for orchestrating the load animation
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08, // Time delay between each child animating in
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [locationSearchTerm, setLocationSearchTerm] = useState('');
  const [targetLocation, setTargetLocation] = useState<PatientLocation | null>(null);
  const [patientLocations, setPatientLocations] = useState<PatientLocation[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const clearLocationSearch = () => setLocationSearchTerm('');

  const upcomingAppointments = appointmentsListData.filter(a => a.type === 'upcoming').sort((a, b) => a.date.getTime() - b.date.getTime());
  const previousAppointments = appointmentsListData.filter(a => a.type === 'previous').sort((a, b) => b.date.getTime() - a.date.getTime());

  // Fetch dashboard statistics and patient locations on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        // Fetch both dashboard stats and patient locations in parallel
        const [stats, locations] = await Promise.all([
          getDashboardStats(user.uid),
          getPatientLocationData(user.uid)
        ]);

        setDashboardStats(stats);
        setPatientLocations(locations);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

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

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    // Wrap the entire page content in a motion.div to control animations
    <motion.div
      className="w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* --- PRIMARY CONTENT COLUMN (LEFT) --- */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          <NewsFeed variants={itemVariants} />

          {/* Geo-distribution and Score Range Section */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <motion.div className="md:col-span-3" variants={itemVariants}>
              <GeographicDistributionCard
                targetLocation={targetLocation}
                patientLocations={patientLocations}
                searchTerm={locationSearchTerm}
                handleSearchSubmit={handleLocationSearchSubmit}
                handleSearchChange={handleLocationSearchChange}
                handleClearSearch={clearLocationSearch}
                handleFilterClick={handleFilterClick}
              />
            </motion.div>
            <DashboardCard title="Score Range" className="md:col-span-2" variants={itemVariants}>
              <ScoreRangeRadarChart stats={dashboardStats} />
            </DashboardCard>
          </div>

          {/* Key Statistics Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DashboardCard title="Avg Scores" variants={itemVariants}>
              <AvgScores stats={dashboardStats} />
            </DashboardCard>
            <DashboardCard title="Patients" variants={itemVariants}>
              <PatientsDistributionChart stats={dashboardStats} />
            </DashboardCard>
            <DashboardCard title="Avg Risk Assessment" variants={itemVariants}>
              <AvgRiskAssessmentChart stats={dashboardStats} />
            </DashboardCard>
          </div>
        </div>

        {/* --- SECONDARY CONTENT COLUMN (RIGHT) --- */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <DashboardCard title="Overall Appointments" variants={itemVariants}>
            <OverallAppointmentsChart />
          </DashboardCard>

          <div className="flex flex-col gap-6">
            <motion.div variants={itemVariants}>
              <AppointmentsList title="Upcoming Appointments" appointments={upcomingAppointments} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <AppointmentsList title="Previous Appointments" appointments={previousAppointments} showTimeFilter />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}