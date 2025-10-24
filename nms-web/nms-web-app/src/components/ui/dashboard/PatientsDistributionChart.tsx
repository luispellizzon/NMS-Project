'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { patientsDistributionData } from '@/lib/mock_data';

export default function PatientsDistributionChart() {
  const totalPatients = patientsDistributionData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    // The fix: Add `overflow-hidden` for consistency and to prevent legend overflow
    <div className="h-64 relative overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={patientsDistributionData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {patientsDistributionData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-3xl font-bold text-gray-800 dark:text-white">{totalPatients}</span>
        <span className="text-sm text-gray-500">Patients</span>
      </div>
    </div>
  );
}