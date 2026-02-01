'use client';

import { useState } from 'react';

export default function ManualEntryForm({
  accounts,
  categories
}: {
  accounts: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [form, setForm] = useState({
    date: '',
    amount: '',
    merchant: '',
    description: '',
    accountId: accounts[0]?.id ?? '',
    categoryId: ''
  });

  const submit = async () => {
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        amount: Number(form.amount)
      })
    });
    if (response.ok) {
      setStatus('Saved transaction.');
      setForm({
        date: '',
        amount: '',
        merchant: '',
        description: '',
        accountId: accounts[0]?.id ?? '',
        categoryId: ''
      });
    } else {
      setStatus('Unable to save.');
    }
  };

  return (
    <div className="rounded-xl border border-surface-3 bg-surface-2 p-6 shadow-soft">
      <h3 className="text-lg font-semibold text-text">Manual entry</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <input
          type="date"
          value={form.date}
          onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
          className="rounded-lg border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          value={form.amount}
          onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
          className="rounded-lg border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text"
        />
        <input
          placeholder="Merchant"
          value={form.merchant}
          onChange={(event) => setForm((prev) => ({ ...prev, merchant: event.target.value }))}
          className="rounded-lg border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text"
        />
        <input
          placeholder="Description"
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          className="rounded-lg border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text"
        />
        <select
          value={form.accountId}
          onChange={(event) => setForm((prev) => ({ ...prev, accountId: event.target.value }))}
          className="rounded-lg border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text"
        >
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
        <select
          value={form.categoryId}
          onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
          className="rounded-lg border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text"
        >
          <option value="">Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={submit}
        className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-surface-1"
      >
        Save transaction
      </button>
      {status ? <p className="mt-2 text-sm text-text-muted">{status}</p> : null}
    </div>
  );
}
