import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { DEFAULT_USER_ID, getOrCreateUser } from '@/lib/defaults';
import { applyRules } from '@/lib/categorization';
import { detectDuplicates, normalizeRow, detectTransfers } from '@/lib/import/parsing';

export async function POST(request: Request) {
  await getOrCreateUser();
  const body = await request.json();
  const { mapping, rows, overrideDuplicates, defaultAccountId } = body;

  if (!mapping?.date || !mapping?.amount || !Array.isArray(rows)) {
    return NextResponse.json({ error: 'Invalid import payload.' }, { status: 400 });
  }

  const rules = await prisma.rule.findMany({ where: { userId: DEFAULT_USER_ID } });
  const existing = await prisma.transaction.findMany({
    where: { userId: DEFAULT_USER_ID },
    select: { date: true, amount: true, merchant: true, accountId: true }
  });

  const toCreate = [] as Array<{
    date: Date;
    amount: number;
    description?: string;
    merchant?: string;
    accountId: string;
    categoryId?: string | null;
    rawDataJson: Record<string, unknown>;
  }>;

  for (const row of rows) {
    const parsed = normalizeRow(row, { ...mapping, accountId: defaultAccountId });
    if (!parsed) continue;

    const rule = applyRules(parsed.description ?? '', parsed.merchant ?? '', rules);
    const accountId = rule?.assignsAccountId ?? parsed.accountId;
    if (!accountId) continue;

    const isDuplicate = detectDuplicates(existing, {
      date: parsed.date,
      amount: parsed.amount,
      merchant: parsed.merchant,
      accountId
    });

    if (isDuplicate && !overrideDuplicates) {
      continue;
    }

    toCreate.push({
      date: parsed.date,
      amount: parsed.amount,
      description: parsed.description,
      merchant: parsed.merchant,
      accountId,
      categoryId: rule?.assignsCategoryId ?? null,
      rawDataJson: parsed.raw
    });
  }

  const created = await prisma.$transaction(
    toCreate.map((row) =>
      prisma.transaction.create({
        data: {
          userId: DEFAULT_USER_ID,
          date: row.date,
          amount: row.amount,
          description: row.description,
          merchant: row.merchant,
          accountId: row.accountId,
          categoryId: row.categoryId,
          importSource: 'xlsx',
          rawDataJson: row.rawDataJson
        }
      })
    )
  );

  const transferPairs = detectTransfers(
    created.map((txn) => ({
      id: txn.id,
      date: txn.date,
      amount: txn.amount,
      accountId: txn.accountId
    }))
  );

  for (const [a, b] of transferPairs) {
    await prisma.transaction.updateMany({
      where: { id: { in: [a, b] }, userId: DEFAULT_USER_ID },
      data: { isTransfer: true }
    });
  }

  return NextResponse.json({ created: created.length, transfersDetected: transferPairs.length });
}
