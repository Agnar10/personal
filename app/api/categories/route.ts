import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { DEFAULT_USER_ID, getOrCreateUser } from '@/lib/defaults';

export async function GET() {
  await getOrCreateUser();
  const categories = await prisma.category.findMany({
    where: { userId: DEFAULT_USER_ID },
    orderBy: { name: 'asc' }
  });
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  await getOrCreateUser();
  const body = await request.json();
  const category = await prisma.category.create({
    data: {
      userId: DEFAULT_USER_ID,
      name: body.name,
      group: body.group ?? 'General',
      defaultBudget: body.defaultBudget ?? 0
    }
  });
  return NextResponse.json(category, { status: 201 });
}
