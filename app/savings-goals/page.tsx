import { prisma } from '@/lib/db';
import { getOrCreateUser } from '@/lib/defaults';
import SavingsGoalsBoard from './SavingsGoalsBoard';
import SectionHeader from '../components/SectionHeader';

export default async function SavingsGoalsPage() {
  const user = await getOrCreateUser();
  const [goals, accounts, contributions] = await Promise.all([
    prisma.savingsGoal.findMany({
      where: { userId: user.id },
      include: { linkedAccount: true }
    }),
    prisma.account.findMany({ where: { userId: user.id }, orderBy: { name: 'asc' } }),
    prisma.goalContribution.findMany({
      where: { goal: { userId: user.id } }
    })
  ]);

  const prepared = goals.map((goal) => {
    const saved = contributions
      .filter((contribution) => contribution.goalId === goal.id)
      .reduce((sum, contribution) => sum + contribution.amount, 0);
    return {
      id: goal.id,
      name: goal.name,
      targetAmount: goal.targetAmount,
      targetDate: goal.targetDate.toISOString().slice(0, 10),
      saved,
      accountName: goal.linkedAccount?.name ?? null
    };
  });

  return (
    <div className="space-y-8">
      <SectionHeader title="Savings Goals" />
      <SavingsGoalsBoard goals={prepared} accounts={accounts} />
    </div>
  );
}
