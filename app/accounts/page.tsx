import { prisma } from '@/lib/db';
import { getOrCreateUser } from '@/lib/defaults';
import AccountsBoard from './AccountsBoard';
import SectionHeader from '../components/SectionHeader';

export default async function AccountsPage() {
  const user = await getOrCreateUser();
  const accounts = await prisma.account.findMany({
    where: { userId: user.id },
    include: { transactions: true }
  });

  const prepared = accounts.map((account) => ({
    id: account.id,
    name: account.name,
    type: account.type,
    currency: account.currency,
    institution: account.institution,
    openingBalance: account.openingBalance,
    balance: account.openingBalance + account.transactions.reduce((sum, txn) => sum + txn.amount, 0)
  }));

  return (
    <div className="space-y-8">
      <SectionHeader title="Accounts" />
      <AccountsBoard accounts={prepared} />
    </div>
  );
}
