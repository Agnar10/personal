import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { DEFAULT_USER_ID, getOrCreateUser } from '@/lib/defaults';

export async function GET() {
  await getOrCreateUser();
  const transactions = await prisma.transaction.findMany({
    where: { userId: DEFAULT_USER_ID },
    include: { category: true, account: true },
    orderBy: { date: 'desc' }
  });
  return NextResponse.json(transactions);
}

export async function POST(request: Request) {
  await getOrCreateUser();
  const body = await request.json();
  const transaction = await prisma.transaction.create({
    data: {
      userId: DEFAULT_USER_ID,
      date: new Date(body.date),
      amount: body.amount,
      merchant: body.merchant ?? null,
      description: body.description ?? null,
      categoryId: body.categoryId || null,
      accountId: body.accountId,
      importSource: body.importSource ?? 'manual',
      rawDataJson: body.rawDataJson ?? null,
      notes: body.notes ?? null,
      isTransfer: body.isTransfer ?? false
    }
  });
  return NextResponse.json(transaction, { status: 201 });
}

export async function PATCH(request: Request) {
  await getOrCreateUser();
  const body = await request.json();
  if (!Array.isArray(body.ids) || !body.categoryId) {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }
  await prisma.transaction.updateMany({
    where: { id: { in: body.ids }, userId: DEFAULT_USER_ID },
    data: { categoryId: body.categoryId }
  });
  return NextResponse.json({ updated: body.ids.length });
}
