import { prisma } from '@/lib/db';
import { getOrCreateUser } from '@/lib/defaults';
import { computeMonthlyMetrics, computeNetWorth } from '@/lib/dashboard/metrics';
import { endOfMonth, formatCurrency, monthKey, startOfMonth } from '@/lib/utils';
import SectionHeader from './components/SectionHeader';
import StatCard from './components/StatCard';
import CashflowChart from './components/CashflowChart';

export default async function DashboardPage() {
  const user = await getOrCreateUser();
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      date: { gte: monthStart, lte: monthEnd }
    }
  });

  const metrics = computeMonthlyMetrics(transactions);

  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const history = await prisma.transaction.findMany({
    where: { userId: user.id, date: { gte: sixMonthsAgo } }
  });

  const cashflowByMonth = history.reduce<Record<string, number>>((acc, txn) => {
    if (txn.isTransfer) return acc;
    const key = monthKey(txn.date);
    acc[key] = (acc[key] ?? 0) + txn.amount;
    return acc;
  }, {});

  const chartLabels = Array.from({ length: 6 }).map((_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return monthKey(date);
  });
  const chartValues = chartLabels.map((label) => cashflowByMonth[label] ?? 0);

  const accounts = await prisma.account.findMany({
    where: { userId: user.id },
    include: { transactions: true }
  });

  const accountBalances = accounts.map((account) => {
    const balance = account.openingBalance + account.transactions.reduce((sum, txn) => sum + txn.amount, 0);
    return { ...account, balance };
  });

  const netWorth = computeNetWorth(
    accountBalances.map((account) => ({ balance: account.balance, type: account.type }))
  );

  return (
    <div className="space-y-8">
      <SectionHeader title="Dashboard" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Income" value={formatCurrency(metrics.income)} accent />
        <StatCard
          label="Expenses"
          value={formatCurrency(metrics.expenses)}
          hint="Transfers excluded"
        />
        <StatCard label="Cashflow" value={formatCurrency(metrics.cashflow)} />
        <StatCard
          label="Savings rate"
          value={`${(metrics.savingsRate * 100).toFixed(1)}%`}
          hint="(Income - Expenses) / Income"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatCard label="Net Worth" value={formatCurrency(netWorth)} />
        <div className="rounded-xl border border-surface-3 bg-surface-2 p-6 shadow-soft">
          <p className="text-sm text-text-muted">Month-over-month snapshot</p>
          <p className="mt-4 text-lg text-text">
            Add balance snapshots in Accounts to unlock comparisons.
          </p>
        </div>
      </div>

      <CashflowChart labels={chartLabels} values={chartValues} />

      <div className="rounded-xl border border-surface-3 bg-surface-2 p-6 shadow-soft">
        <h3 className="text-lg font-semibold text-text">Accounts overview</h3>
        <div className="mt-4 space-y-3">
          {accountBalances.length === 0 ? (
            <p className="text-sm text-text-muted">No accounts yet. Add one in Accounts.</p>
          ) : (
            accountBalances.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between rounded-lg border border-surface-3 bg-surface-3 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-text">{account.name}</p>
                  <p className="text-xs text-text-muted">{account.institution ?? 'Local'} · {account.type}</p>
                </div>
                <p className="text-sm font-semibold text-text">
                  {formatCurrency(account.balance, account.currency)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
