"use client";

import type { ProjectionResult, SummaryResult } from "@/lib/calc/types";

const downloadFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const ProjectionHeader = [
  "Date",
  "Month #",
  "Gross Salary (ISK)",
  "Pension (ISK)",
  "Tax (ISK)",
  "Net Salary (ISK)",
  "Expenses (ISK)",
  "Savings Deposit (ISK)",
  "Interest Annual",
  "Interest Monthly",
  "Inflation Annual",
  "Inflation Monthly",
  "Savings Balance (ISK)"
];

const ExportButtons = ({ projection, summary }: { projection: ProjectionResult; summary: SummaryResult }) => {
  const handleExportProjection = () => {
    const rows = projection.rows.map((row) => [
      row.date,
      row.monthIndex,
      row.grossSalaryISK,
      row.pensionISK,
      row.taxISK,
      row.netSalaryISK,
      row.expensesISK,
      row.savingsDepositISK,
      row.interestRateAnnual,
      row.interestRateMonthly,
      row.inflationRateAnnual,
      row.inflationRateMonthly,
      row.savingsBalanceISK
    ]);
    const csv = [ProjectionHeader, ...rows].map((row) => row.join(",")).join("\n");
    downloadFile(csv, `${projection.scenarioName}-monthly-projection.csv`);
  };

  const handleExportSummary = () => {
    const csv = [
      ["Metric", "Value"],
      ["Starting balance", summary.startingSavingsBalanceISK],
      ["Total deposits", summary.totalSavingsDepositsISK],
      ["Total interest", summary.totalInterestEarnedISK],
      ["Final balance", summary.finalSavingsBalanceISK],
      ["Total expenses", summary.totalExpensesISK],
      ["Average monthly savings", summary.averageMonthlySavingsISK],
      ["Total gross salary", summary.totalGrossSalaryISK],
      ["Total pension", summary.totalPensionISK],
      ["Total tax", summary.totalTaxISK]
    ]
      .map((row) => row.join(","))
      .join("\n");
    downloadFile(csv, `${projection.scenarioName}-summary.csv`);
  };

  return (
    <div className="flex items-center gap-3 text-xs">
      <button
        className="rounded-full border border-neon-cyan px-3 py-1 text-neon-cyan"
        onClick={handleExportProjection}
      >
        Export monthly CSV
      </button>
      <button
        className="rounded-full border border-neon-purple px-3 py-1 text-neon-purple"
        onClick={handleExportSummary}
      >
        Export summary CSV
      </button>
    </div>
  );
};

export default ExportButtons;
