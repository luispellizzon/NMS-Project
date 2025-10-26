// src/components/ui/dashboard/PatientsDistributionChart.tsx
'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from 'next-themes';

const data = [
  { name: 'Men', value: 400, color: { light: '#3b82f6', dark: '#2563eb' } },
  { name: 'Women', value: 300, color: { light: '#8b5cf6', dark: '#7c3aed' } },
];

export default function PatientsDistributionChart() {
  const { resolvedTheme } = useTheme();
  const themeMode = resolvedTheme === 'dark' ? 'dark' : 'light';
  const totalPatients = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="h-54 relative overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color[themeMode]} />
            ))}
          </Pie>
          <Legend
            iconSize={10}
            layout="vertical"
            verticalAlign="middle"
            align="right"
            wrapperStyle={{ color: 'var(--foreground)' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center mr-20 justify-center pointer-events-none">
        <span className="text-3xl font-bold text-foreground">{totalPatients}</span>
        <span className="text-sm text-muted-foreground">Patients</span>
      </div>
    </div>
  );
}