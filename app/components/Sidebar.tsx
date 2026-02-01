import Link from 'next/link';

const nav = [
  { href: '/', label: 'Dashboard' },
  { href: '/transactions', label: 'Transactions' },
  { href: '/budgets', label: 'Budgets' },
  { href: '/savings-goals', label: 'Savings Goals' },
  { href: '/accounts', label: 'Accounts' },
  { href: '/rules', label: 'Rules' },
  { href: '/settings', label: 'Settings' }
];

export default function Sidebar() {
  return (
    <aside className="min-h-screen w-64 border-r border-surface-3 bg-surface-2 px-6 py-8">
      <div className="mb-10">
        <h1 className="text-xl font-semibold text-accent">Ledgerly</h1>
        <p className="text-sm text-text-muted">Local-first finance OS</p>
      </div>
      <nav className="space-y-2">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-text-muted transition hover:bg-surface-3 hover:text-text"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
