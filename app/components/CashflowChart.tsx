'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function CashflowChart({
  labels,
  values
}: {
  labels: string[];
  values: number[];
}) {
  return (
    <div className="rounded-xl border border-surface-3 bg-surface-2 p-6 shadow-soft">
      <h3 className="text-lg font-semibold text-text">Cashflow trend</h3>
      <div className="mt-4 h-64">
        <Line
          data={{
            labels,
            datasets: [
              {
                label: 'Cashflow',
                data: values,
                borderColor: '#1fd17a',
                backgroundColor: 'rgba(31, 209, 122, 0.2)'
              }
            ]
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              x: {
                ticks: { color: '#9aa7a3' },
                grid: { color: 'rgba(255,255,255,0.05)' }
              },
              y: {
                ticks: { color: '#9aa7a3' },
                grid: { color: 'rgba(255,255,255,0.05)' }
              }
            }
          }}
        />
      </div>
    </div>
  );
}
