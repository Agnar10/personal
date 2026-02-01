const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const userId = 'local-user';
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, name: 'Local User' }
  });

  const checking = await prisma.account.create({
    data: {
      userId,
      type: 'DEBIT',
      name: 'Checking',
      institution: 'Local Bank',
      currency: 'USD',
      openingBalance: 1500
    }
  });

  const groceries = await prisma.category.create({
    data: {
      userId,
      name: 'Groceries',
      group: 'Essentials',
      defaultBudget: 400
    }
  });

  await prisma.transaction.create({
    data: {
      userId,
      date: new Date(),
      amount: -54.2,
      merchant: 'Neighborhood Market',
      description: 'Weekly groceries',
      categoryId: groceries.id,
      accountId: checking.id,
      importSource: 'seed',
      rawDataJson: { source: 'seed' }
    }
  });

  await prisma.budget.create({
    data: {
      userId,
      month: new Date().toISOString().slice(0, 7),
      categoryId: groceries.id,
      limit: 400
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
