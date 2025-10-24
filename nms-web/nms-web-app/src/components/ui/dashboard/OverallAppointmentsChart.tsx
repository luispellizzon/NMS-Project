'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { appointmentsChartData } from '@/lib/mock_data';

const legendLabels = {
  assessment: 'Assessment',
  screening: 'Screening',
  consultation: 'Consultation',
  followUp: 'Follow-up',
};

export default function OverallAppointmentsChart() {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={appointmentsChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid #ccc',
              borderRadius: '0.5rem',
            }}
          />
          <Legend
            iconSize={10}
            formatter={(value) => legendLabels[value as keyof typeof legendLabels]}
          />
          <Bar dataKey="assessment" stackId="a" fill="#8884d8" name={legendLabels.assessment} />
          <Bar dataKey="screening" stackId="a" fill="#82ca9d" name={legendLabels.screening} />
          <Bar dataKey="consultation" stackId="a" fill="#ffc658" name={legendLabels.consultation} />
          <Bar dataKey="followUp" stackId="a" fill="#ff8042" name={legendLabels.followUp} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}