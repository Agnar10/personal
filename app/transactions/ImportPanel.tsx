'use client';

import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';

type Mapping = {
  date: string;
  amount: string;
  description?: string;
  merchant?: string;
  accountId?: string;
};

type Account = {
  id: string;
  name: string;
};

type Category = {
  id: string;
  name: string;
};

export default function ImportPanel({
  accounts,
  categories
}: {
  accounts: Account[];
  categories: Category[];
}) {
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheetName, setSheetName] = useState('');
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [mapping, setMapping] = useState<Mapping>({ date: '', amount: '' });
  const [status, setStatus] = useState<string | null>(null);
  const [overrideDuplicates, setOverrideDuplicates] = useState(false);

  const headers = useMemo(() => {
    if (rows.length === 0) return [];
    return Object.keys(rows[0] ?? {});
  }, [rows]);

  const handleFile = async (file: File) => {
    const data = await file.arrayBuffer();
    const parsed = XLSX.read(data, { type: 'array' });
    setWorkbook(parsed);
    const firstSheet = parsed.SheetNames[0] ?? '';
    setSheetName(firstSheet);
    loadSheet(parsed, firstSheet);
  };

  const loadSheet = (book: XLSX.WorkBook, name: string) => {
    const sheet = book.Sheets[name];
    if (!sheet) return;
    const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    setRows(json as Record<string, unknown>[]);
  };

  const handleImport = async () => {
    if (!mapping.date || !mapping.amount || rows.length === 0) {
      setStatus('Please choose a date and amount column.');
      return;
    }
    const response = await fetch('/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mapping,
        rows,
        overrideDuplicates,
        defaultAccountId: mapping.accountId
      })
    });
    const payload = await response.json();
    if (!response.ok) {
      setStatus(payload.error ?? 'Import failed.');
      return;
    }
    setStatus(`Imported ${payload.created} transactions.`);
  };

  return (
    <div className="rounded-xl border border-surface-3 bg-surface-2 p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text">Import XLSX</h3>
          <p className="text-sm text-text-muted">Upload Excel files and map columns.</p>
        </div>
        <label className="cursor-pointer rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-surface-1">
          Upload file
          <input
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>
      </div>

      {workbook ? (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap gap-3">
            <div>
              <p className="text-xs uppercase text-text-muted">Worksheet</p>
              <select
                value={sheetName}
                onChange={(event) => {
                  const name = event.target.value;
                  setSheetName(name);
                  if (workbook) loadSheet(workbook, name);
                }}
                className="mt-1 w-48 rounded-lg border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text"
              >
                {workbook.SheetNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs uppercase text-text-muted">Account</p>
              <select
                value={mapping.accountId ?? ''}
                onChange={(event) =>
                  setMapping((prev) => ({ ...prev, accountId: event.target.value }))
                }
                className="mt-1 w-48 rounded-lg border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text"
              >
                <option value="">Select account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              { key: 'date', label: 'Date' },
              { key: 'amount', label: 'Amount' },
              { key: 'description', label: 'Description' },
              { key: 'merchant', label: 'Merchant/Payee' }
            ].map(({ key, label }) => (
              <div key={key}>
                <p className="text-xs uppercase text-text-muted">{label}</p>
                <select
                  value={mapping[key as keyof Mapping] ?? ''}
                  onChange={(event) =>
                    setMapping((prev) => ({ ...prev, [key]: event.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text"
                >
                  <option value="">Select column</option>
                  {headers.map((header) => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm text-text-muted">
            <input
              type="checkbox"
              checked={overrideDuplicates}
              onChange={(event) => setOverrideDuplicates(event.target.checked)}
              className="h-4 w-4 rounded border-surface-3 bg-surface-3 text-accent"
            />
            Allow duplicate imports (override detection)
          </label>

          <button
            onClick={handleImport}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-surface-1"
          >
            Import mapped rows
          </button>
          {status ? <p className="text-sm text-text-muted">{status}</p> : null}
        </div>
      ) : (
        <p className="mt-4 text-sm text-text-muted">Upload an XLSX file to begin.</p>
      )}

      {categories.length === 0 ? (
        <p className="mt-4 text-xs text-text-muted">
          Tip: Add categories in Settings to auto-assign budgets and rules.
        </p>
      ) : null}
    </div>
  );
}
