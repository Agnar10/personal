import { prisma } from '@/lib/db';
import { getOrCreateUser } from '@/lib/defaults';
import RulesBoard from './RulesBoard';
import SectionHeader from '../components/SectionHeader';

export default async function RulesPage() {
  const user = await getOrCreateUser();
  const [rules, categories, accounts] = await Promise.all([
    prisma.rule.findMany({
      where: { userId: user.id },
      include: { assignsCategory: true, assignsAccount: true },
      orderBy: { priority: 'asc' }
    }),
    prisma.category.findMany({ where: { userId: user.id }, orderBy: { name: 'asc' } }),
    prisma.account.findMany({ where: { userId: user.id }, orderBy: { name: 'asc' } })
  ]);

  const prepared = rules.map((rule) => ({
    id: rule.id,
    priority: rule.priority,
    matchType: rule.matchType,
    pattern: rule.pattern,
    categoryName: rule.assignsCategory?.name ?? null,
    accountName: rule.assignsAccount?.name ?? null
  }));

  return (
    <div className="space-y-8">
      <SectionHeader title="Rules" />
      <RulesBoard rules={prepared} categories={categories} accounts={accounts} />
    </div>
  );
}
