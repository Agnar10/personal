"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend
} from "recharts";
import type { ProjectionResult } from "@/lib/calc/types";

const numberFormatter = new Intl.NumberFormat("is-IS");

const toISK = (value: number): string => `${numberFormatter.format(value)} Kr`;

type ComparisonChartProps = {
  projections: ProjectionResult[];
  showReal: boolean;
  baselineId?: string;
};

const palette = ["#a855f7", "#22d3ee", "#f472b6", "#38bdf8", "#facc15"];

const ComparisonChart = ({ projections, showReal }: ComparisonChartProps) => {
  const maxMonths = Math.max(...projections.map((projection) => projection.rows.length), 0);
  const data = Array.from({ length: maxMonths }, (_, index) => {
    const rowData: Record<string, number | string> = {
      month: index + 1
    };
    projections.forEach((projection) => {
      const row = projection.rows[index];
      if (row) {
        rowData[projection.scenarioId] = showReal ? row.realSavingsBalanceISK : row.savingsBalanceISK;
      }
    });
    return rowData;
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 12, right: 24, left: 8, bottom: 0 }}>
        <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} />
        <YAxis
          stroke="#94a3b8"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => numberFormatter.format(value as number)}
        />
        <Tooltip
          contentStyle={{ background: "#0f172a", border: "1px solid #1f2937", color: "#e2e8f0" }}
          formatter={(value: number) => toISK(value)}
        />
        <Legend />
        {projections.map((projection, index) => (
          <Line
            key={projection.scenarioId}
            type="monotone"
            dataKey={projection.scenarioId}
            name={projection.scenarioName}
            stroke={palette[index % palette.length]}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ComparisonChart;
