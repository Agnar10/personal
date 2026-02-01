'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';

type Budget = {
  id: string;
  month: string;
  limit: number;
  categoryName: string;
  spent: number;
};

type Category = { id: string; name: string };

export default function BudgetBoard({
  budgets,
  categories
}: {
  budgets: Budget[];
  categories: Category[];
}) {
  const [form, setForm] = useState({ month: '', categoryId: '', limit: '' });
  const [status, setStatus] = useState<string | null>(null);

  const submit = async () => {
    const response = await fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        month: form.month,
        categoryId: form.categoryId,
        limit: Number(form.limit)
      })
    });
    if (!response.ok) {
      setStatus('Unable to save budget.');
    } else {
      setStatus('Budget saved.');
      setForm({ month: '', categoryId: '', limit: '' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-surface-3 bg-surface-2 p-6 shadow-soft">
        <h3 className="text-lg font-semibold text-text">Create budget</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <input
            type="month"
            value={form.month}
            onChange={(event) => setForm((prev) => ({ ...prev, month: event.target.value }))}
            className="rounded-lg border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text"
          />
          <select
            value={form.categoryId}
            onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
            className="rounded-lg border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text"
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            step="0.01"
            placeholder="Monthly limit"
            value={form.limit}
            onChange={(event) => setForm((prev) => ({ ...prev, limit: event.target.value }))}
            className="rounded-lg border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text"
          />
        </div>
        <button
          onClick={submit}
          className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-surface-1"
        >
          Save budget
        </button>
        {status ? <p className="mt-2 text-sm text-text-muted">{status}</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {budgets.map((budget) => {
          const progress = budget.limit > 0 ? Math.min((budget.spent / budget.limit) * 100, 100) : 0;
          return (
            <div
              key={budget.id}
              className="rounded-xl border border-surface-3 bg-surface-2 p-5 shadow-soft"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">{budget.month}</p>
                  <h4 className="text-lg font-semibold text-text">{budget.categoryName}</h4>
                </div>
                <p className="text-sm text-text-muted">
                  {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                </p>
              </div>
              <div className="mt-4 h-2 w-full rounded-full bg-surface-3">
                <div
                  className="h-2 rounded-full bg-accent"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
