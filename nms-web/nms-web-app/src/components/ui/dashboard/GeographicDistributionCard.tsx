'use client';

import { PatientLocation, patientLocations } from '@/lib/mock_data';
import DashboardCard from './DashboardCard';
import GeographicDistributionMap from './GeographicDistributionMap';
import GenericSearchBar from '../common/SearchBar';

type GeographicDistributionCardProps = {
  targetLocation: PatientLocation | null;
  searchTerm: string;
  handleSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleClearSearch: () => void;
  handleFilterClick: (location: PatientLocation) => void;
};

export default function GeographicDistributionCard({
  targetLocation,
  searchTerm,
  handleSearchSubmit,
  handleSearchChange,
  handleClearSearch, 
  handleFilterClick,
}: GeographicDistributionCardProps) {
  return (
    <DashboardCard
      className="md:col-span-3"
      title={
        <div className="flex justify-between items-center w-full">
          <h3 className="font-bold text-xl text-card-foreground">Geographic Distribution</h3>
          <div className="w-full max-w-xs">
            <GenericSearchBar
                value={searchTerm}
                onChange={handleSearchChange}
                onSubmit={handleSearchSubmit}
                onClear={handleClearSearch}
                placeholder="Search location..."
            />
          </div>
        </div>
      }
      footer={
        <div className="flex flex-nowrap gap-2 overflow-x-auto pt-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {patientLocations.map((loc) => (
            <button key={loc.city} onClick={() => handleFilterClick(loc)} className="px-3 py-1 text-xs text-white bg-gray-700/60 rounded-full hover:bg-brand-primary transition-colors backdrop-blur-sm flex-shrink-0">
              {loc.city}
            </button>
          ))}
        </div>
      }
    >
      <GeographicDistributionMap targetLocation={targetLocation} />
    </DashboardCard>
  );
}