import type { SummaryResult } from "@/lib/calc/types";

const numberFormatter = new Intl.NumberFormat("is-IS");
const toISK = (value: number): string => `${numberFormatter.format(value)} Kr`;

type SummaryCardsProps = {
  summary: SummaryResult;
};

const SummaryCards = ({ summary }: SummaryCardsProps) => {
  const cards = [
    { label: "Starting balance", value: toISK(summary.startingSavingsBalanceISK) },
    { label: "Total deposits", value: toISK(summary.totalSavingsDepositsISK) },
    { label: "Total interest earned", value: toISK(summary.totalInterestEarnedISK) },
    { label: "Final balance", value: toISK(summary.finalSavingsBalanceISK) },
    { label: "Total expenses", value: toISK(summary.totalExpensesISK) },
    { label: "Average monthly savings", value: toISK(summary.averageMonthlySavingsISK) },
    { label: "Total gross salary", value: toISK(summary.totalGrossSalaryISK) },
    { label: "Total pension", value: toISK(summary.totalPensionISK) },
    { label: "Total tax", value: toISK(summary.totalTaxISK) }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-panel-border bg-panel px-4 py-4">
          <div className="text-xs text-slate-400">{card.label}</div>
          <div className="mt-2 text-lg font-semibold text-white">{card.value}</div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
