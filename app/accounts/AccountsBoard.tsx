'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';

type Account = {
  id: string;
  name: string;
  type: string;
  currency: string;
  institution?: string | null;
  openingBalance: number;
  balance: number;
};

export default function AccountsBoard({ accounts }: { accounts: Account[] }) {
  const [form, setForm] = useState({
    name: '',
    type: 'CASH',
    institution: '',
    currency: 'USD',
    openingBalance: ''
  });
  const [snapshot, setSnapshot] = useState({ accountId: '', date: '', balance: '' });
  const [status, setStatus] = useState<string | null>(null);

  const submitAccount = async () => {
    const response = await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        openingBalance: Number(form.openingBalance)
      })
    });
    setStatus(response.ok ? 'Account saved.' : 'Unable to save account.');
  };

  const submitSnapshot = async () => {
    const response = await fetch('/api/accounts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...snapshot,
        balance: Number(snapshot.balance)
      })
    });
    setStatus(response.ok ? 'Snapshot saved.' : 'Unable to save snapshot.');
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-surface-3 bg-surface-2 p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-text">Add account</h3>
          <div className="mt-4 grid gap-3">
            <input
              placeholder="Account name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className="rounded-lg border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text"
            />
            <div className="grid gap-3 md:grid-cols-2">
              <select
                value={form.type}
                onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
                className="rounded-lg border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text"
              >
                <option value="CASH">Cash</option>
                <option value="DEBIT">Debit</option>
                <option value="CREDIT">Credit</option>
                <option value="SAVINGS">Savings</option>
              </select>
              <input
                placeholder="Institution"
                value={form.institution}
                onChange={(event) => setForm((prev) => ({ ...prev, institution: event.target.value }))}
                className="rounded-lg border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                placeholder="Currency"
                value={form.currency}
                onChange={(event) => setForm((prev) => ({ ...prev, currency: event.target.value }))}
                className="rounded-lg border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Opening balance"
                value={form.openingBalance}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, openingBalance: event.target.value }))
                }
                className="rounded-lg border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text"
              />
            </div>
          </div>
          <button
            onClick={submitAccount}
            className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-surface-1"
          >
            Save account
          </button>
        </div>

        <div className="rounded-xl border border-surface-3 bg-surface-2 p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-text">Balance snapshot</h3>
          <div className="mt-4 grid gap-3">
            <select
              value={snapshot.accountId}
              onChange={(event) =>
                setSnapshot((prev) => ({ ...prev, accountId: event.target.value }))
              }
              className="rounded-lg border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text"
            >
              <option value="">Select account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={snapshot.date}
              onChange={(event) => setSnapshot((prev) => ({ ...prev, date: event.target.value }))}
              className="rounded-lg border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Balance"
              value={snapshot.balance}
              onChange={(event) =>
                setSnapshot((prev) => ({ ...prev, balance: event.target.value }))
              }
              className="rounded-lg border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text"
            />
          </div>
          <button
            onClick={submitSnapshot}
            className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-surface-1"
          >
            Save snapshot
          </button>
          {status ? <p className="mt-2 text-sm text-text-muted">{status}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {accounts.map((account) => (
          <div key={account.id} className="rounded-xl border border-surface-3 bg-surface-2 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-text">{account.name}</h4>
                <p className="text-sm text-text-muted">{account.institution ?? 'Local'} · {account.type}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-text-muted">Opening</p>
                <p className="text-sm font-semibold text-text">
                  {formatCurrency(account.openingBalance, account.currency)}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm text-text-muted">Current balance</p>
              <p className="text-sm font-semibold text-accent">
                {formatCurrency(account.balance, account.currency)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
