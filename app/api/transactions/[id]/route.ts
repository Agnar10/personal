import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { DEFAULT_USER_ID, getOrCreateUser } from '@/lib/defaults';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  await getOrCreateUser();
  const body = await request.json();
  await prisma.transaction.updateMany({
    where: { id: params.id, userId: DEFAULT_USER_ID },
    data: {
      isTransfer: body.isTransfer ?? undefined,
      notes: body.notes ?? undefined
    }
  });
  const updated = await prisma.transaction.findUnique({ where: { id: params.id } });
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  await getOrCreateUser();
  await prisma.transaction.deleteMany({
    where: { id: params.id, userId: DEFAULT_USER_ID }
  });
  return NextResponse.json({ deleted: true });
}
