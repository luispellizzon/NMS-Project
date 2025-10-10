import { Search } from 'lucide-react';
import DashboardCard from '@/components/ui/dashboard/DashboardCard';

export default function DashboardPage() {
  return (
    <div className="w-full">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Risk Dashboard
        </h1>
        <div className="relative mt-4 md:mt-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search test results"
            className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d7377]"
          />
        </div>
      </header>

      {/* Grid for Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <DashboardCard title="Overall Appointments" className="md:col-span-2 lg:col-span-1">
            <p className="text-gray-500">Appointment chart will go here...</p>
          </DashboardCard>
          <DashboardCard title="News" className="md:col-span-2">
             <p className="text-gray-500">News feed will go here...</p>
          </DashboardCard>
          <DashboardCard title="Geographic Distribution">
            <p className="text-gray-500">Map will go here...</p>
          </DashboardCard>
          <DashboardCard title="Score Range">
            <p className="text-gray-500">Score radar chart will go here...</p>
          </DashboardCard>
          <DashboardCard title="Avg Scores">
            <p className="text-gray-500">Average score chart will go here...</p>
          </DashboardCard>
           <DashboardCard title="Avg Risk Assessment" className="md:col-span-2 lg:col-span-1">
            <p className="text-gray-500">Risk chart will go here...</p>
          </DashboardCard>
      </div>
    </div>
  );
}