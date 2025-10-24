'use client';

import { forwardRef } from 'react';
import { PatientLocation } from '@/lib/mock_data';

type TooltipProps = {
  visible: boolean;
  data: PatientLocation | null;
  pos: { x: number; y: number };
};

const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(({ visible, data, pos }, ref) => {
  if (!data) return null;
  return (
    <div
      ref={ref}
      className={`absolute p-3 text-sm text-white bg-gray-900/80 rounded-lg pointer-events-none shadow-xl backdrop-blur-sm transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        top: pos.y + 15,
        left: pos.x + 15,
      }}
    >
      <p className="font-bold text-base">{data.city}</p>
      <div className="mt-1">
        <p>
          <span className="font-semibold">Patients:</span> {data.patientCount}
        </p>
        <p>
          <span className="font-semibold">Risk Level:</span>{' '}
          <span style={{ color: data.color }}>{data.riskLevel}</span>
        </p>
      </div>
    </div>
  );
});

Tooltip.displayName = 'Tooltip';
export default Tooltip;