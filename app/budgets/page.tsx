import { prisma } from '@/lib/db';
import { getOrCreateUser } from '@/lib/defaults';
import BudgetBoard from './BudgetBoard';
import SectionHeader from '../components/SectionHeader';

export default async function BudgetsPage() {
  const user = await getOrCreateUser();
  const [budgets, categories, transactions] = await Promise.all([
    prisma.budget.findMany({
      where: { userId: user.id },
      include: { category: true },
      orderBy: { month: 'desc' }
    }),
    prisma.category.findMany({ where: { userId: user.id }, orderBy: { name: 'asc' } }),
    prisma.transaction.findMany({ where: { userId: user.id, isTransfer: false } })
  ]);

  const computed = budgets.map((budget) => {
    const spent = transactions
      .filter(
        (txn) =>
          txn.categoryId === budget.categoryId &&
          txn.date.toISOString().slice(0, 7) === budget.month
      )
      .reduce((sum, txn) => sum + Math.abs(Math.min(txn.amount, 0)), 0);
    return {
      id: budget.id,
      month: budget.month,
      limit: budget.limit,
      categoryName: budget.category.name,
      spent
    };
  });

  return (
    <div className="space-y-8">
      <SectionHeader title="Budgets" />
      <BudgetBoard budgets={computed} categories={categories} />
    </div>
  );
}
