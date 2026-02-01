import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { DEFAULT_USER_ID, getOrCreateUser } from '@/lib/defaults';

export async function GET() {
  await getOrCreateUser();
  const accounts = await prisma.account.findMany({
    where: { userId: DEFAULT_USER_ID },
    orderBy: { name: 'asc' }
  });
  return NextResponse.json(accounts);
}

export async function POST(request: Request) {
  await getOrCreateUser();
  const body = await request.json();
  const account = await prisma.account.create({
    data: {
      userId: DEFAULT_USER_ID,
      name: body.name,
      type: body.type,
      institution: body.institution || null,
      currency: body.currency || 'USD',
      openingBalance: body.openingBalance ?? 0
    }
  });
  return NextResponse.json(account, { status: 201 });
}

export async function PATCH(request: Request) {
  await getOrCreateUser();
  const body = await request.json();
  const snapshot = await prisma.balanceSnapshot.create({
    data: {
      accountId: body.accountId,
      date: new Date(body.date),
      balance: body.balance
    }
  });
  return NextResponse.json(snapshot, { status: 201 });
}
