'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';

type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: string;
  saved: number;
  accountName?: string | null;
};

type Account = { id: string; name: string };

export default function SavingsGoalsBoard({
  goals,
  accounts
}: {
  goals: Goal[];
  accounts: Account[];
}) {
  const [form, setForm] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    linkedAccountId: ''
  });
  const [status, setStatus] = useState<string | null>(null);

  const submit = async () => {
    const response = await fetch('/api/savings-goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        targetAmount: Number(form.targetAmount)
      })
    });
    if (!response.ok) {
      setStatus('Unable to save goal.');
    } else {
      setStatus('Goal saved.');
      setForm({ name: '', targetAmount: '', targetDate: '', linkedAccountId: '' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-surface-3 bg-surface-2 p-6 shadow-soft">
        <h3 className="text-lg font-semibold text-text">Create savings goal</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <input
            placeholder="Goal name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            className="rounded-lg border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Target amount"
            value={form.targetAmount}
            onChange={(event) => setForm((prev) => ({ ...prev, targetAmount: event.target.value }))}
            className="rounded-lg border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text"
          />
          <input
            type="date"
            value={form.targetDate}
            onChange={(event) => setForm((prev) => ({ ...prev, targetDate: event.target.value }))}
            className="rounded-lg border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text"
          />
          <select
            value={form.linkedAccountId}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, linkedAccountId: event.target.value }))
            }
            className="rounded-lg border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text"
          >
            <option value="">Link account</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={submit}
          className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-surface-1"
        >
          Save goal
        </button>
        {status ? <p className="mt-2 text-sm text-text-muted">{status}</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {goals.map((goal) => {
          const progress = goal.targetAmount > 0 ? (goal.saved / goal.targetAmount) * 100 : 0;
          return (
            <div key={goal.id} className="rounded-xl border border-surface-3 bg-surface-2 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase text-text-muted">{goal.accountName ?? 'Unlinked'}</p>
                  <h4 className="text-lg font-semibold text-text">{goal.name}</h4>
                </div>
                <div className="text-right">
                  <p className="text-sm text-text-muted">Target {goal.targetDate}</p>
                  <p className="text-sm font-semibold text-text">
                    {formatCurrency(goal.saved)} / {formatCurrency(goal.targetAmount)}
                  </p>
                </div>
              </div>
              <div className="mt-4 h-2 w-full rounded-full bg-surface-3">
                <div
                  className="h-2 rounded-full bg-accent"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
