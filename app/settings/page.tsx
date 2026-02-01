import { prisma } from '@/lib/db';
import { getOrCreateUser } from '@/lib/defaults';
import SectionHeader from '../components/SectionHeader';
import SettingsPanel from './SettingsPanel';

export default async function SettingsPage() {
  const user = await getOrCreateUser();
  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-8">
      <SectionHeader title="Settings" />
      <SettingsPanel categories={categories} settings={{
        currency: user.currency,
        monthStartDay: user.monthStartDay
      }} />
    </div>
  );
}
