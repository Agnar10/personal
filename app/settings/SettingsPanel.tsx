'use client';

import { useState } from 'react';

type Category = { id: string; name: string; group: string };

type Settings = {
  currency: string;
  monthStartDay: number;
};

export default function SettingsPanel({
  categories,
  settings
}: {
  categories: Category[];
  settings: Settings;
}) {
  const [categoryForm, setCategoryForm] = useState({ name: '', group: '' });
  const [config, setConfig] = useState(settings);
  const [status, setStatus] = useState<string | null>(null);

  const saveCategory = async () => {
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryForm)
    });
    setStatus(response.ok ? 'Category saved.' : 'Unable to save category.');
  };

  const saveSettings = async () => {
    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    setStatus(response.ok ? 'Settings saved.' : 'Unable to save settings.');
  };

  const exportData = async () => {
    const response = await fetch('/api/settings', { method: 'GET' });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'ledgerly-export.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    const response = await fetch('/api/settings', { method: 'PUT', body: form });
    setStatus(response.ok ? 'Import completed.' : 'Import failed.');
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-surface-3 bg-surface-2 p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-text">Preferences</h3>
          <div className="mt-4 grid gap-3">
            <input
              value={config.currency}
              onChange={(event) => setConfig((prev) => ({ ...prev, currency: event.target.value }))}
              placeholder="Currency (e.g. USD)"
              className="rounded-lg border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text"
            />
            <input
              type="number"
              min="1"
              max="28"
              value={config.monthStartDay}
              onChange={(event) =>
                setConfig((prev) => ({ ...prev, monthStartDay: Number(event.target.value) }))
              }
              placeholder="Month start day"
              className="rounded-lg border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text"
            />
          </div>
          <button
            onClick={saveSettings}
            className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-surface-1"
          >
            Save settings
          </button>
        </div>

        <div className="rounded-xl border border-surface-3 bg-surface-2 p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-text">Import / Export</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={exportData}
              className="rounded-lg border border-accent px-4 py-2 text-sm font-semibold text-accent"
            >
              Export data
            </button>
            <label className="cursor-pointer rounded-lg bg-surface-3 px-4 py-2 text-sm text-text">
              Import JSON
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) importData(file);
                }}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-surface-3 bg-surface-2 p-6 shadow-soft">
        <h3 className="text-lg font-semibold text-text">Categories</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <input
            placeholder="Category name"
            value={categoryForm.name}
            onChange={(event) =>
              setCategoryForm((prev) => ({ ...prev, name: event.target.value }))
            }
            className="rounded-lg border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text"
          />
          <input
            placeholder="Group (e.g. Essentials)"
            value={categoryForm.group}
            onChange={(event) =>
              setCategoryForm((prev) => ({ ...prev, group: event.target.value }))
            }
            className="rounded-lg border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text"
          />
          <button
            onClick={saveCategory}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-surface-1"
          >
            Add category
          </button>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="rounded-lg border border-surface-3 bg-surface-3 px-4 py-3"
            >
              <p className="text-sm font-medium text-text">{category.name}</p>
              <p className="text-xs text-text-muted">{category.group}</p>
            </div>
          ))}
        </div>
      </div>

      {status ? <p className="text-sm text-text-muted">{status}</p> : null}
    </div>
  );
}
