'use client';

import { useState, useRef } from 'react';
import { PatientLocation } from '@/types/location';
import Globe from './Globe';
import Tooltip from './Tooltip';

type GeographicDistributionMapProps = {
  targetLocation: PatientLocation | null;
  patientLocations: PatientLocation[];
};

export default function GeographicDistributionMap({ targetLocation, patientLocations }: GeographicDistributionMapProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipData, setTooltipData] = useState<PatientLocation | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleHover = (data: PatientLocation | null, pos: { x: number; y: number }) => {
    setTooltipData(data);
    setTooltipVisible(!!data);
    setTooltipPos(pos);
  };

  return (
    <div className="relative h-full w-full min-h-[250px] cursor-grab active:cursor-grabbing rounded-lg overflow-hidden -m-4">
      <Globe targetLocation={targetLocation} patientLocations={patientLocations} onHover={handleHover} />
      <Tooltip
        ref={tooltipRef}
        data={tooltipData}
        visible={tooltipVisible}
        pos={tooltipPos}
      />
    </div>
  );
}