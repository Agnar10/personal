export type ParsedRow = {
  date: Date;
  amount: number;
  description?: string;
  merchant?: string;
  accountId?: string;
  raw: Record<string, unknown>;
};

const excelEpoch = new Date(Date.UTC(1899, 11, 30));

export function parseExcelDate(value: unknown): Date | null {
  if (value == null) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'number') {
    return new Date(excelEpoch.getTime() + value * 86400000);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return null;
}

export function parseAmount(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const normalized = value.replace(/,/g, '').trim();
    if (!normalized) return null;
    const parsed = Number(normalized);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

export function normalizeRow(
  row: Record<string, unknown>,
  mapping: {
    date: string;
    amount: string;
    description?: string;
    merchant?: string;
    accountId?: string;
  }
): ParsedRow | null {
  const dateValue = parseExcelDate(row[mapping.date]);
  const amountValue = parseAmount(row[mapping.amount]);
  if (!dateValue || amountValue == null) return null;

  return {
    date: dateValue,
    amount: amountValue,
    description:
      mapping.description != null ? String(row[mapping.description] ?? '') : undefined,
    merchant: mapping.merchant != null ? String(row[mapping.merchant] ?? '') : undefined,
    accountId: mapping.accountId,
    raw: row
  };
}

export function detectDuplicates(
  existing: Array<{
    date: Date;
    amount: number;
    merchant?: string | null;
    accountId: string;
  }>,
  incoming: ParsedRow
): boolean {
  const dateKey = incoming.date.toISOString().slice(0, 10);
  return existing.some((txn) => {
    const txnDate = txn.date.toISOString().slice(0, 10);
    return (
      txnDate === dateKey &&
      txn.amount === incoming.amount &&
      (txn.merchant ?? '').toLowerCase() === (incoming.merchant ?? '').toLowerCase() &&
      txn.accountId === incoming.accountId
    );
  });
}

export function detectTransfers(
  transactions: Array<{ id: string; date: Date; amount: number; accountId: string }>,
  windowDays = 3
): Array<[string, string]> {
  const pairs: Array<[string, string]> = [];
  for (let i = 0; i < transactions.length; i += 1) {
    for (let j = i + 1; j < transactions.length; j += 1) {
      const a = transactions[i];
      const b = transactions[j];
      if (a.accountId === b.accountId) continue;
      if (Math.abs(a.amount + b.amount) > 0.001) continue;
      const diffDays = Math.abs(a.date.getTime() - b.date.getTime()) / 86400000;
      if (diffDays <= windowDays) {
        pairs.push([a.id, b.id]);
      }
    }
  }
  return pairs;
}
