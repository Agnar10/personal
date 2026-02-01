import { prisma } from './db';

const DEFAULT_USER_ID = 'local-user';

export async function getOrCreateUser() {
  const existing = await prisma.user.findUnique({ where: { id: DEFAULT_USER_ID } });
  if (existing) return existing;
  return prisma.user.create({
    data: {
      id: DEFAULT_USER_ID,
      name: 'Local User'
    }
  });
}

export { DEFAULT_USER_ID };
