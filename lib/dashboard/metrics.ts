import type { Transaction } from '@prisma/client';

type Metrics = {
  income: number;
  expenses: number;
  cashflow: number;
  savingsRate: number;
};

export function computeMonthlyMetrics(transactions: Transaction[]): Metrics {
  const income = transactions
    .filter((t) => t.amount > 0 && !t.isTransfer)
    .reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions
    .filter((t) => t.amount < 0 && !t.isTransfer)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const cashflow = income - expenses;
  const savingsRate = income > 0 ? (income - expenses) / income : 0;
  return { income, expenses, cashflow, savingsRate };
}

export function computeNetWorth(accounts: Array<{ balance: number; type: string }>): number {
  return accounts.reduce((sum, account) => {
    const isLiability = account.type === 'CREDIT';
    return sum + (isLiability ? -account.balance : account.balance);
  }, 0);
}
