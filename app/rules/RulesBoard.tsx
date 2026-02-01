'use client';

import { useState } from 'react';

type Rule = {
  id: string;
  priority: number;
  matchType: string;
  pattern: string;
  categoryName?: string | null;
  accountName?: string | null;
};

type Category = { id: string; name: string };

type Account = { id: string; name: string };

export default function RulesBoard({
  rules,
  categories,
  accounts
}: {
  rules: Rule[];
  categories: Category[];
  accounts: Account[];
}) {
  const [form, setForm] = useState({
    priority: '1',
    matchType: 'CONTAINS',
    pattern: '',
    assignsCategoryId: '',
    assignsAccountId: ''
  });
  const [status, setStatus] = useState<string | null>(null);

  const submit = async () => {
    const response = await fetch('/api/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        priority: Number(form.priority)
      })
    });
    setStatus(response.ok ? 'Rule saved.' : 'Unable to save rule.');
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-surface-3 bg-surface-2 p-6 shadow-soft">
        <h3 className="text-lg font-semibold text-text">Create rule</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <input
            type="number"
            min="1"
            value={form.priority}
            onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value }))}
            placeholder="Priority"
            className="rounded-lg border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text"
          />
          <select
            value={form.matchType}
            onChange={(event) => setForm((prev) => ({ ...prev, matchType: event.target.value }))}
            className="rounded-lg border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text"
          >
            <option value="CONTAINS">Contains</option>
            <option value="STARTS_WITH">Starts with</option>
            <option value="ENDS_WITH">Ends with</option>
            <option value="REGEX">Regex</option>
          </select>
          <input
            placeholder="Pattern (merchant/description)"
            value={form.pattern}
            onChange={(event) => setForm((prev) => ({ ...prev, pattern: event.target.value }))}
            className="rounded-lg border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text"
          />
          <select
            value={form.assignsCategoryId}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, assignsCategoryId: event.target.value }))
            }
            className="rounded-lg border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text"
          >
            <option value="">Assign category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            value={form.assignsAccountId}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, assignsAccountId: event.target.value }))
            }
            className="rounded-lg border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text"
          >
            <option value="">Assign account</option>
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
          Save rule
        </button>
        {status ? <p className="mt-2 text-sm text-text-muted">{status}</p> : null}
      </div>

      <div className="space-y-3">
        {rules.map((rule) => (
          <div key={rule.id} className="rounded-xl border border-surface-3 bg-surface-2 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-text-muted">Priority {rule.priority}</p>
                <p className="text-sm text-text">
                  {rule.matchType} · <span className="text-accent">{rule.pattern}</span>
                </p>
              </div>
              <div className="text-right text-xs text-text-muted">
                <p>{rule.categoryName ?? 'No category'}</p>
                <p>{rule.accountName ?? 'No account'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
