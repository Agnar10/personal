import type { ProjectionResult } from "@/lib/calc/types";

const numberFormatter = new Intl.NumberFormat("is-IS");
const toISK = (value: number): string => `${numberFormatter.format(value)} Kr`;
const toPct = (value: number): string => `${(value * 100).toFixed(2)}%`;

type ProjectionTableProps = {
  projection: ProjectionResult;
  showReal: boolean;
};

const ProjectionTable = ({ projection, showReal }: ProjectionTableProps) => {
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-panel-border">
      <table className="min-w-full divide-y divide-panel-border text-xs">
        <thead className="bg-panel-2 text-slate-300">
          <tr>
            <th className="px-3 py-2 text-left">Date</th>
            <th className="px-3 py-2 text-left">Month #</th>
            <th className="px-3 py-2 text-left">Gross salary</th>
            <th className="px-3 py-2 text-left">Pension</th>
            <th className="px-3 py-2 text-left">Tax</th>
            <th className="px-3 py-2 text-left">Net salary</th>
            <th className="px-3 py-2 text-left">Expenses</th>
            <th className="px-3 py-2 text-left">Savings deposit</th>
            <th className="px-3 py-2 text-left">Interest (annual / monthly)</th>
            <th className="px-3 py-2 text-left">Inflation (annual / monthly)</th>
            <th className="px-3 py-2 text-left">Savings balance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-panel-border">
          {projection.rows.map((row) => (
            <tr key={row.monthIndex} className="text-slate-200">
              <td className="px-3 py-2">{row.date}</td>
              <td className="px-3 py-2">{row.monthIndex}</td>
              <td className="px-3 py-2">{toISK(row.grossSalaryISK)}</td>
              <td className="px-3 py-2">{toISK(row.pensionISK)}</td>
              <td className="px-3 py-2">{toISK(row.taxISK)}</td>
              <td className="px-3 py-2">
                {toISK(showReal ? row.realNetSalaryISK : row.netSalaryISK)}
              </td>
              <td className="px-3 py-2">{toISK(showReal ? row.realExpensesISK : row.expensesISK)}</td>
              <td className="px-3 py-2">{toISK(row.savingsDepositISK)}</td>
              <td className="px-3 py-2">
                {toPct(row.interestRateAnnual)} / {toPct(row.interestRateMonthly)}
              </td>
              <td className="px-3 py-2">
                {toPct(row.inflationRateAnnual)} / {toPct(row.inflationRateMonthly)}
              </td>
              <td className="px-3 py-2">
                {toISK(showReal ? row.realSavingsBalanceISK : row.savingsBalanceISK)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectionTable;
