import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { DEFAULT_USER_ID, getOrCreateUser } from '@/lib/defaults';

export async function GET() {
  await getOrCreateUser();
  const goals = await prisma.savingsGoal.findMany({
    where: { userId: DEFAULT_USER_ID },
    include: { contributions: true }
  });
  return NextResponse.json(goals);
}

export async function POST(request: Request) {
  await getOrCreateUser();
  const body = await request.json();
  const goal = await prisma.savingsGoal.create({
    data: {
      userId: DEFAULT_USER_ID,
      name: body.name,
      targetAmount: body.targetAmount,
      targetDate: new Date(body.targetDate),
      linkedAccountId: body.linkedAccountId || null
    }
  });
  return NextResponse.json(goal, { status: 201 });
}
