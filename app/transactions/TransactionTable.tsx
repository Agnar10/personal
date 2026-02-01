'use client';

import { useMemo, useState } from 'react';
import { formatCurrency } from '@/lib/utils';

export type TransactionRow = {
  id: string;
  date: string;
  amount: number;
  merchant?: string | null;
  description?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  accountName: string;
  isTransfer: boolean;
};

type Category = { id: string; name: string };

type Props = {
  transactions: TransactionRow[];
  categories: Category[];
};

export default function TransactionTable({ transactions, categories }: Props) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState('');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return transactions;
    return transactions.filter((txn) =>
      `${txn.merchant ?? ''} ${txn.description ?? ''}`.toLowerCase().includes(term)
    );
  }, [query, transactions]);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkCategorize = async () => {
    if (!categoryId || selected.length === 0) return;
    await fetch('/api/transactions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selected, categoryId })
    });
    setSelected([]);
  };

  const handleTransferToggle = async (id: string, isTransfer: boolean) => {
    await fetch(`/api/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isTransfer: !isTransfer })
    });
  };

  return (
    <div className="rounded-xl border border-surface-3 bg-surface-2 p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search transactions"
          className="w-64 rounded-lg border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text"
        />
        <div className="flex items-center gap-2">
          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="rounded-lg border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text"
          >
            <option value="">Bulk recategorize</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleBulkCategorize}
            className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-surface-1"
          >
            Apply
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead className="text-left text-xs uppercase text-text-muted">
            <tr>
              <th className="py-2"></th>
              <th className="py-2">Date</th>
              <th className="py-2">Merchant</th>
              <th className="py-2">Description</th>
              <th className="py-2">Account</th>
              <th className="py-2">Category</th>
              <th className="py-2 text-right">Amount</th>
              <th className="py-2">Transfer</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((txn) => (
              <tr key={txn.id} className="border-t border-surface-3">
                <td className="py-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(txn.id)}
                    onChange={() => toggleSelect(txn.id)}
                    className="h-4 w-4 rounded border-surface-3 bg-surface-3 text-accent"
                  />
                </td>
                <td className="py-3 text-text-muted">{txn.date}</td>
                <td className="py-3 text-text">{txn.merchant ?? '-'}</td>
                <td className="py-3 text-text-muted">{txn.description ?? '-'}</td>
                <td className="py-3 text-text-muted">{txn.accountName}</td>
                <td className="py-3 text-text">{txn.categoryName ?? 'Uncategorized'}</td>
                <td className={`py-3 text-right ${txn.amount < 0 ? 'text-negative' : 'text-accent'}`}>
                  {formatCurrency(txn.amount)}
                </td>
                <td className="py-3">
                  <button
                    onClick={() => handleTransferToggle(txn.id, txn.isTransfer)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      txn.isTransfer
                        ? 'bg-accent text-surface-1'
                        : 'border border-surface-3 text-text-muted'
                    }`}
                  >
                    {txn.isTransfer ? 'Yes' : 'No'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
