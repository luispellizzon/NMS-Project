'use client';

import { PatientLocation } from '@/types/location';
import DashboardCard from './DashboardCard';
import GeographicDistributionMap from './GeographicDistributionMap';
import GenericSearchBar from '../common/SearchBar';

type GeographicDistributionCardProps = {
  targetLocation: PatientLocation | null;
  patientLocations: PatientLocation[];
  searchTerm: string;
  handleSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleClearSearch: () => void;
  handleFilterClick: (location: PatientLocation) => void;
};

export default function GeographicDistributionCard({
  targetLocation,
  patientLocations,
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
          {patientLocations.length > 0 ? (
            patientLocations.map((loc) => (
              <button key={loc.city} onClick={() => handleFilterClick(loc)} className="px-3 py-1 text-xs text-white bg-gray-700/60 rounded-full hover:bg-brand-primary transition-colors backdrop-blur-sm flex-shrink-0">
                {loc.city} ({loc.patientCount})
              </button>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No patient locations available</p>
          )}
        </div>
      }
    >
      <GeographicDistributionMap targetLocation={targetLocation} patientLocations={patientLocations} />
    </DashboardCard>
  );
}