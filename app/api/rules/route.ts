import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { DEFAULT_USER_ID, getOrCreateUser } from '@/lib/defaults';

export async function GET() {
  await getOrCreateUser();
  const rules = await prisma.rule.findMany({
    where: { userId: DEFAULT_USER_ID },
    orderBy: { priority: 'asc' }
  });
  return NextResponse.json(rules);
}

export async function POST(request: Request) {
  await getOrCreateUser();
  const body = await request.json();
  const rule = await prisma.rule.create({
    data: {
      userId: DEFAULT_USER_ID,
      priority: body.priority,
      matchType: body.matchType,
      pattern: body.pattern,
      assignsCategoryId: body.assignsCategoryId || null,
      assignsAccountId: body.assignsAccountId || null
    }
  });
  return NextResponse.json(rule, { status: 201 });
}
