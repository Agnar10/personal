import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { DEFAULT_USER_ID, getOrCreateUser } from '@/lib/defaults';

export async function GET() {
  await getOrCreateUser();
  const budgets = await prisma.budget.findMany({
    where: { userId: DEFAULT_USER_ID },
    include: { category: true },
    orderBy: { month: 'desc' }
  });
  return NextResponse.json(budgets);
}

export async function POST(request: Request) {
  await getOrCreateUser();
  const body = await request.json();
  const budget = await prisma.budget.upsert({
    where: { month_categoryId: { month: body.month, categoryId: body.categoryId } },
    update: { limit: body.limit },
    create: {
      userId: DEFAULT_USER_ID,
      month: body.month,
      categoryId: body.categoryId,
      limit: body.limit
    }
  });
  return NextResponse.json(budget, { status: 201 });
}
