import { prisma } from '@/lib/db';
import { getOrCreateUser } from '@/lib/defaults';
import { formatCurrency } from '@/lib/utils';
import ImportPanel from './ImportPanel';
import ManualEntryForm from './ManualEntryForm';
import TransactionTable from './TransactionTable';
import SectionHeader from '../components/SectionHeader';

export default async function TransactionsPage() {
  const user = await getOrCreateUser();
  const [transactions, categories, accounts] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: user.id },
      include: { category: true, account: true },
      orderBy: { date: 'desc' },
      take: 200
    }),
    prisma.category.findMany({ where: { userId: user.id }, orderBy: { name: 'asc' } }),
    prisma.account.findMany({ where: { userId: user.id }, orderBy: { name: 'asc' } })
  ]);

  const rows = transactions.map((txn) => ({
    id: txn.id,
    date: txn.date.toISOString().slice(0, 10),
    amount: txn.amount,
    merchant: txn.merchant,
    description: txn.description,
    categoryId: txn.categoryId,
    categoryName: txn.category?.name ?? null,
    accountName: txn.account.name,
    isTransfer: txn.isTransfer
  }));

  return (
    <div className="space-y-8">
      <SectionHeader title="Transactions" />
      <div className="grid gap-6 lg:grid-cols-2">
        <ImportPanel accounts={accounts} categories={categories} />
        <ManualEntryForm accounts={accounts} categories={categories} />
      </div>
      <TransactionTable transactions={rows} categories={categories} />
      <div className="rounded-xl border border-surface-3 bg-surface-2 p-6 text-sm text-text-muted">
        <p>
          Duplicate detection uses date + amount + merchant + account. Overrides are allowed for
          intentional duplicates. Transfers are excluded from income/expense metrics.
        </p>
        <p className="mt-3">
          Current total: {formatCurrency(transactions.reduce((sum, txn) => sum + txn.amount, 0))}
        </p>
      </div>
    </div>
  );
}
